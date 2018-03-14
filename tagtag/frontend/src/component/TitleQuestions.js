import React from 'react'

import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import gql from 'graphql-tag'
import { client } from '../graphql'
// eslint-disable-next-line
import { getNewKey } from '../util';

import { Table, Spin, Select, Row, Col, Input, Button } from 'antd'
const Option = Select.Option


const labels_query_params = (value) => {
  return {
    query: gql`
      query OptionsQuery {
        gp_labels {
          id label_name label_level skill_type label_type parent_id
        }
      }
    `,
  }
}

const SKILL_TYPES = {'阅读': 'YD', '听力': 'TL'}

const AUTO_COMPLETE_HANDLERS = {
  skill_level_1: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question, title) => {
      return gp_labels
        .filter(x => x.skill_type === SKILL_TYPES[title.title_category])
        .filter(x => x.label_level === 1 && x.label_type === 'WJN')
        .map(x => ({value: "" + x.id, text: x.label_name}))
        .filter(x => !value || x.text.indexOf(value) !== -1)
    }
  },
  skill_level_2: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question, title) => {
      let skill_level_1 = gp_labels.find(x => x.id === question.skill_level_1)
      return gp_labels
        .filter(x => x.skill_type === SKILL_TYPES[title.title_category])
        .filter(x => x.label_level === 2 && x.label_type === 'WJN')
        .filter(x => skill_level_1 ? skill_level_1.id === x.parent_id : false)
        .map(x => ({value: "" + x.id, text: x.label_name}))
        .filter(x => !value || x.text.indexOf(value) !== -1)
    }
  },
  content_level_1: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question, title) => {
      return gp_labels
        .filter(x => x.skill_type === SKILL_TYPES[title.title_category])
        .filter(x => x.label_level === 1 && x.label_type === 'NRKJ')
        .map(x => ({value: "" + x.id, text: x.label_name}))
        .filter(x => !value || x.text.indexOf(value) !== -1)
    }
  },
  content_level_2: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question, title) => {
      let content_level_1 = gp_labels.find(x => x.id === question.content_level_1)
      return gp_labels
        .filter(x => x.skill_type === SKILL_TYPES[title.title_category])
        .filter(x => x.label_level === 2 && x.label_type === 'NRKJ')
        .filter(x => content_level_1 ? content_level_1.id === x.parent_id : false)
        .map(x => ({value: "" + x.id, text: x.label_name}))
        .filter(x => !value || x.text.indexOf(value) !== -1)
    }
  },
}

const _getProperContent = (field, {title}) => {
  switch (field.type) {
    case 'select':
      return (
        <Select
          defaultValue={field.defaultValue || ""}
          size='small'
          disabled={title.label_review_status === '评审通过'}
          onChange={(value) => field.onChange(value)} >
          {field.options.map(o => (<Option value={o.value} key={o.value}>{o.text}</Option>))}
        </Select>
      )
    case 'select-dynamic':
      return (
        <Select
          size='small'
          mode="multiple"
          showSearch
          labelInValue
          onBlur={field.onBlur}
          onFocus={field.onFocus}
          disabled={title.label_review_status === '评审通过'}
          value={field.value}
          placeholder={field.placeholder || ""}
          notFoundContent={field.fetching ? <Spin size="small" /> : null}
          filterOption={false}
          onSearch={value => field.onSearch(value)}
          onChange={value => field.onChange(value)}
          style={{ width: '100%' }}
          >
          {field.options.map(d => <Option key={d.value}>{d.text}</Option>)}
        </Select>
      )
    case 'text':
      return ': ' + (field.options
        ? field.options.find(o => o.value === field.defaultValue).text
        : field.defaultValue)
    default:
      return "No proper field type"
  }
}

const on_change_of_field = (that, dataIndex, question, questions) => {
  return value => {
    console.log('on_change_of_field', dataIndex, question, questions, that, value)
    let field_value = value && value[0] && value[0].key
    that.setState(({ questions }) => ({
      questions: questions.map(x => {
        return x === question ? {...x, [dataIndex]: field_value ? parseInt(field_value, 10) : undefined} : x
      })
    }))
  }
}

const on_search_of_field = (that, dataIndex, question, questions, fieldList) => {
  return value => {
    console.log('on_search_of_field', dataIndex, question, questions, that, value)
    client.query(
      AUTO_COMPLETE_HANDLERS[dataIndex].query_params(value)
    ).then(response => {
      that.setState(({ questions_options }) => {
        questions_options[questions.indexOf(question)] = {
          ...questions_options[questions.indexOf(question)],
          [dataIndex]: AUTO_COMPLETE_HANDLERS[dataIndex].options_builder(response, value, question, that.props.title),
        }
        return { questions_options }
      })
    })
  }
}

const IMPORTANT_FIELDS = [
  'title_ident',
  'question_index',
  'skill_level_1',
  'skill_level_2',
];

const questionSemanticEq = (x, y) => {
  return IMPORTANT_FIELDS.every(k =>
    ("" + x[k]) === ("" + y[k])
  )
}

const handleGqlResp = (operation, info_prefix='操作')  => ({data, errors}) => {
  if ((Array.isArray(errors) && errors.length) || (!Array.isArray(errors) && errors)) {
    alert(`${info_prefix}不成功: ` + errors.map(x => x.message))
    console.log(`${operation} ERROR:`, errors)
  } else {
    alert(`${info_prefix}成功`)
    console.log(`${operation} OK:`, data)
  }
}

class QuestionsBase extends React.Component {
  handleChangeOfQuestion = ({ label, dataIndex, value }) => {
    this.setState(({ errors={}, questions=[], }) => {
      let vs = {
        [`"${value}" 已经存在了，请使用其它值`]: (questions.find(x => x[dataIndex] === value && x.id !== label.id)),
        [`不可以使用 "${value}"，请使用其它值`]: (questions.find(x => x.id && !value)),
      }
      return {
        errors: { ...errors, [ dataIndex + ":" + label.key ]: Object.keys(vs).filter(k => vs[k]) }
      }
    })
    this.setState({
      questions: this.state.questions.map(x => {
        return x.key === label.key ? {...x, [dataIndex]: value } : x
      })
    })
  }

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        checked_questions: selectedRows
      })
    },
    getCheckboxProps: record => ({
      disabled: false 
    }),
  }

  saveQuestions = async () => {
    console.log('saveQuestions...');

    let { errors } = this.state

    if (
      errors
      && Object.keys(errors).some(k => errors[k].length > 0)
        ) {
      alert(
        Object.keys(errors)
              .filter(k => errors[k].length > 0)
              .map(k => errors[k]))
      return
    }
    let modified_questions = this.__getModifiedQuestions()
    if (modified_questions.length === 0) {
      alert('没有可保存的题目。(题目的必填项为：问题序号、微技能一级标签、微技能二级标签)')
      return
    }
    await Promise.all(
      modified_questions
        .map(x => this.__modifyQuestion(x)))
    await this.__push_questions_to_es()
  }

  __push_questions_to_es = async () => {
    let { data, errors } = await client.mutate({
      mutation: gql`
        mutation push_title ($title_ident: String!) {
          push_title (title_ident: $title_ident) {
            status
          }
        }
      `,
      variables: this.state.title,
    })
    handleGqlResp('push_title', "保存")({ data, errors })
  }

  __modifyQuestion = async (question) => {
    let {data, errors} = await client.mutate({
      mutation: gql`
        mutation ModifyQuestion(
            $id: Int
            $question_index: Int!
            $title_ident: String!
            $content_level_1: String!
            $content_level_2: String!
            $skill_level_1: String!
            $skill_level_2: String!
          ) {
          change_question(
            id: $id
            question_index: $question_index
            title_ident: $title_ident
            content_level_1: $content_level_1
            content_level_2: $content_level_2
            skill_level_1: $skill_level_1
            skill_level_2: $skill_level_2
          ) {
            question {
              id
              question_index
              title_ident
              content_level_1
              content_level_2
              skill_level_1
              skill_level_2
            }
          }
        }
      `,
      variables: question,
    })
    if (errors) {
      console.log('errors: ', errors)
    } else {
      let { change_question: { question } } = data
      console.log('__modifyQuestion: ', question)
      this.setState(({ questions }) => ({
        questions: questions.map(x => questionSemanticEq(x, question) ? question : x)
      }))
    }
  }

  __getModifiedQuestions = () => {
    return this.state.questions.filter(x => IMPORTANT_FIELDS.every(field => x[field]))
  }

  addTempQuestion = () => {
    this.setState(({questions, columns}) => {
      let question = {title_ident: this.state.title.title_ident}
      columns.forEach(x => question[x.dataIndex] = "")
      return {
        questions: questions.concat([question])
      }
    })
  }

  removeQuestions = () => {
    let { checked_questions } = this.state
    checked_questions
      && window.confirm('确定要删除这些记录吗？')
      // eslint-disable-next-line
      && checked_questions.filter(x => !x.id).map(question => {
           this.setState(({ questions }) => {
             return {
               questions: questions.filter(x => !questionSemanticEq(x, question))
             }
           })
         })
      // eslint-disable-next-line
      && Promise.all(checked_questions.filter(x => x.id).map(question => {
          return client.mutate({
            mutation: gql`
              mutation DeleteQuestion($id: Int!) {
                delete_question(id: $id) {
                  status
                }
              }
            `,
            variables: question,
          }).then(resp => {
            let { data: { delete_question: { status } } } = resp
            console.log('deleteQuestion: ', status, question);

            this.setState(({ questions, checked_questions }) => ({
              questions: questions.filter(x => x.id !== question.id),
              checked_questions: checked_questions.filter(x => x.id !== question.id),
            }))
            return resp
          })
        })).then(resp => {
          let data = resp.map(({data}) => data)
          let errors = resp.map(({errors}) => errors)
          handleGqlResp('deleteQuestions', '删除')({
            data,
            errors: (errors.every(x => x) && errors) || undefined,
          })
        })
  }

  exportQuestions = () => {console.log('exportQuestions');}
}

class TitleQuestions extends QuestionsBase {
  state = {
    questions: [],
    questions_options: [],
    title: {},
    columns: [
      { title: "问题序号", dataIndex: 'question_index', },
      { title: "微技能一级标签", dataIndex: 'skill_level_1', },
      { title: "微技能二级标签", dataIndex: 'skill_level_2', },
      { title: "内容一级标签", dataIndex: 'content_level_1', },
      { title: "内容二级标签", dataIndex: 'content_level_2', }
    ],
    column_renders: {
      question_index: (handleQFieldChange, {title}) => (text, record) =>
        <Input size='small' value={text}
          onChange={handleQFieldChange('question_index', record)}
          disabled={title.label_review_status === '评审通过'}
        />
    },
  }

  constructor (props) {
    super(props)
    client.query(labels_query_params()).then(({data: {gp_labels}}) => {
      this.setState({ gp_labels })
    })
  }

  handleQFieldChange = (dataIndex, question) => ({target: {value}}) => {
    console.log('handleQFieldChange', dataIndex, question, value)
    this.setState(({ questions }) => ({
      questions: questions.map(x => x === question ? {...x, [dataIndex]: value} : x)
    }))
  }

  componentWillReceiveProps({questions, title}) {
    if (title.label_review_status === '评审通过' || (questions && questions.length)) {
      this.setState({questions, title})
    } else {
      if (title && title.title_ident) {
        for (let i = questions.length; i < 5; i++ ) {
          let question = {title_ident: title.title_ident}
          this.state.columns.forEach(x => question[x.dataIndex] = "")
          questions = questions.concat([question])
        }
      }
      this.setState({questions, title})
    }
  }

  passReview = async () => {
    let {data, errors} = await this.props.client.mutate({
      mutation: gql`
        mutation passQuestionReview( $title_ident: String! ) {
          pass_question_detail_review( title_ident: $title_ident ) {
            status
            title {
              id
              platform
              title_ident
              title_detail_path
              title_type
              title_course
              title_category
              title_info
              title_url
              video_path
              version
              discourse_code
              block_id
              label_tag_user
              label_tag_status
              label_review_user
              label_review_status
              review_fail_reason
              tutorial_id
              tutorial_name
              unit_id
              unit_name
              minicoz_id
              minicoz_name
              task_id
            }
          }
        }
      `,
      variables: this.state.title,
    })
    if (errors) {
      alert("操作不成功: " + errors.map(x => x.message))
      console.log('pass_question_detail_review ERROR:', errors)
    } else {
      alert("操作成功")
      console.log('pass_question_detail_review OK:', data)
      this.setState({title: data.pass_question_detail_review.title})
    }
  }

  notPassReview = async () => {
    let {data, errors} = await this.props.client.mutate({
      mutation: gql`
        mutation passQuestionReview( $title_ident: String!, $review_fail_reason: String!) {
          not_pass_question_detail_review( title_ident: $title_ident, review_fail_reason: $review_fail_reason ) {
            status
            title {
              id
              platform
              title_ident
              title_detail_path
              title_type
              title_course
              title_category
              title_info
              title_url
              video_path
              version
              discourse_code
              block_id
              label_tag_user
              label_tag_status
              label_review_user
              label_review_status
              review_fail_reason
              tutorial_id
              tutorial_name
              unit_id
              unit_name
              minicoz_id
              minicoz_name
              task_id
            }
          }
        }
      `,
      variables: this.state.title,
    })
    if (errors) {
      alert("操作不成功: " + errors.map(x => x.message))
      console.log('not_pass_question_detail_review ERROR:', errors)
    } else {
      alert("操作成功")
      console.log('not_pass_question_detail_review OK:', data)
      this.setState({title: data.not_pass_question_detail_review.title})
    }
  }

  handle_review_fail_reason_change = ({target: {value}}) => {
    console.log('handle_review_fail_reason_change', 'review_fail_reason', this.state.title, value)
    this.setState(({ title }) => {
      return { title: {...title, review_fail_reason: value} }
    })
  }

  render () {
    let { questions, questions_options, gp_labels, title } = this.state
    let that = this
    let { columns, column_renders } = this.state
    let _columns = columns.map(x => {
      let pr = column_renders[x.dataIndex]
      return pr ? {...x, render: pr(this.handleQFieldChange, {title})}
        : {
          ...x,
          render: (value, question) => {
            let gp_label = gp_labels ? gp_labels.find(x => x.id === parseInt(value, 10)) : undefined
            let _value = gp_label ? {key: gp_label.id, label: gp_label.label_name} : undefined

            let question_options = questions_options[questions.indexOf(question)]
            question_options = question_options ? question_options : {}
            let field = {
              onFocus: on_search_of_field(that, x.dataIndex, question, questions),
              onSearch: on_search_of_field(that, x.dataIndex, question, questions),
              onChange: on_change_of_field(that, x.dataIndex, question, questions),
              options: question_options[x.dataIndex] ? question_options[x.dataIndex] : [],
              value: _value ? _value : undefined,
              fetching: false,
              type: 'select-dynamic',
            }
            return _getProperContent(field, {title})
          }
        }
    })
    return  (
      <div>
        <Table dataSource={this.state.questions} columns={_columns} rowSelection={this.rowSelection}
          style={{background: '#fff', padding: '20px 0px' }} pagination={false}/>
        <Row>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.saveQuestions}
              disabled={title.label_review_status === '评审通过'}>保存</Button>
          </Col>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.removeQuestions}
              disabled={title.label_review_status === '评审通过'}>删除</Button>
          </Col>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.addTempQuestion}
              disabled={title.label_review_status === '评审通过'}>新增</Button>
          </Col>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.passReview}
              disabled={title.label_review_status === '评审通过'}>评审通过</Button>
          </Col>
        </Row>
        <Row style={{ marginTop: "15px" }}>
          <Col span={20} style={{ textAlign: 'left' }}>
            <textarea style={{width: "96%", height: "100%"}}
              onChange={this.handle_review_fail_reason_change}
              value={this.state.title.review_fail_reason}
              disabled={
                title.label_review_status === '评审通过'
              }></textarea>
          </Col>
          <Col span={3} style={{ textAlign: 'left' }}>
            <Button type="primary" onClick={this.notPassReview}
              disabled={
                title.label_review_status === '评审通过' 
              }>评审不通过</Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default withApollo(
  connect(
    (state, ownProps) => ({ currentUser: state.currentUser || {} })
  )(TitleQuestions))
