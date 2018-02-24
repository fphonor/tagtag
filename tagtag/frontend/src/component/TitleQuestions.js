import React from 'react'

import { withApollo } from 'react-apollo'
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

const AUTO_COMPLETE_HANDLERS = {
  skill_level_1: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question) => {
      return gp_labels
        .filter(x => x.label_level === 1 && x.label_type === 'WJN')
        .map(x => ({value: x.id, text: x.label_name}))
        .filter(x => !value || x.text.indexOf(value) !== -1)
    }
  },
  skill_level_2: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question) => {
      let skill_level_1 = gp_labels.find(x => x.id === question.skill_level_1)
      return gp_labels
        .filter(x => x.label_level === 2 && x.label_type === 'WJN')
        .filter(x => skill_level_1 ? skill_level_1.id === x.parent_id : true)
        .map(x => ({value: x.id, text: x.label_name}))
        .filter(x => !value || x.text.indexOf(value) !== -1)
    }
  },
  content_level_1: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question) => {
      return gp_labels
        .filter(x => x.label_level === 1 && x.label_type === 'NRKJ')
        .map(x => ({value: x.id, text: x.label_name}))
        .filter(x => !value || x.text.indexOf(value) !== -1)
    }
  },
  content_level_2: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question) => {
      let content_level_1 = gp_labels.find(x => x.id === question.content_level_1)
      return gp_labels
        .filter(x => x.label_level === 2 && x.label_type === 'NRKJ')
        .filter(x => content_level_1 ? content_level_1.id === x.parent_id : true)
        .map(x => ({value: x.id, text: x.label_name}))
        .filter(x => !value || x.text.indexOf(value) !== -1)
    }
  },
}

const _getProperContent = (field) => {
  switch (field.type) {
    case 'select':
      return (
        <Select
          defaultValue={field.defaultValue || ""}
          size='small'
          disabled={!!field.disabled}
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
      questions: questions.map(x => x === question ? {...x, [dataIndex]: field_value ? parseInt(field_value, 10) : undefined} : x)
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
          [dataIndex]: AUTO_COMPLETE_HANDLERS[dataIndex].options_builder(response, value, question),
        }
        return { questions_options }
      })
    })
  }
}

const questionSemanticEq = (x, y) => {
  return [
    'title_ident',
    'question_index',
    'skill_level_1',
    'skill_level_2',
    'content_level_1',
    'content_level_2',
  ].every(k =>
    x[k] === y[k]
  )
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
    await Promise.all(
      this.__getModifiedQuestions()
        .filter(ml => ml.label_name && !!ml.label_name.trim())
        .map(ml => this.__modifyQuestion(ml)))
    this.__push_questions_to_es()
  }

  __push_questions_to_es() {
    client.mutate({
      mutation: gql`
      `,
      variables: 
    }).then(res => {
    })

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
          ) {
          change_question(
            id: $id
            question_index: $question_index
            title_ident: $title_ident
            content_level_1: $content_level_1
            content_level_2: $content_level_2
            skill_level_1: $skill_level_1
          ) {
            question {
              id
              question_index
              title_ident
              content_level_1
              content_level_2
              skill_level_1
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
      this.setState(({ originQuestions, questions }) => ({
        originQuestions: originQuestions.find(x => questionSemanticEq(x, question))
          ? originQuestions.map(x => x.id === question.id ? question : x)
          : originQuestions.concat([question]),
        questions: questions.map(x => questionSemanticEq(x, question) ? question : x)
      }))
    }
  }

  __getModifiedQuestions = () => {
    let that = this
    return this.state.questions.filter(x => {
      if (x.id === undefined) {
        return true;
      } else {
        let res = that.state.originQuestions.find(y => {
          return (x.id === y.id && !questionSemanticEq(x, y))
        })
        console.log('res: ', res)
        return !!res
      }
    })
  }

  addTempQuestion = () => {
    this.setState(({questions, columns}) => {
      let question = {}
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
      && checked_questions.filter(x => x.id).map(question => {
          client.mutate({
            mutation: gql`
              mutation DeleteQuestion($id: Int!) {
                delete_question(id: $id) {
                  status
                }
              }
            `,
            variables: question,
          }).then(({ data: { delete_question: { status }}})=> {
            console.log('deleteQuestion: ', status, question);

            this.setState(({ origin_questions, questions, checked_questions }) => ({
              origin_questions: origin_questions.filter(x => x.id !== question.id),
              questions: questions.filter(x => x.id !== question.id),
              checked_questions: checked_questions.filter(x => x.id !== question.id),
            }))
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
      question_index: handleQFieldChange => (text, record) => <Input size='small' value={text} onChange={handleQFieldChange('question_index', record)}/>
    },
    origin_questions: [],
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

  render () {
    let { questions, questions_options, gp_labels } = this.state
    let that = this
    let { columns, column_renders } = this.state
    let _columns = columns.map(x => {
      let pr = column_renders[x.dataIndex]
      return pr ? {...x, render: pr(this.handleQFieldChange)}
        : {
          ...x,
          render: (value, question) => {
            let gp_label = gp_labels ? gp_labels.find(x => x.id === value) : undefined
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
            return _getProperContent(field)
          }
        }
    })
    return  (
      <div>
        <Table dataSource={this.state.questions} columns={_columns} rowSelection={this.rowSelection}
          style={{background: '#fff', padding: '20px 0px' }} pagination={false}/>
        <Row>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.saveQuestions}>保存</Button>
          </Col>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.removeQuestions}>删除</Button>
          </Col>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.addTempQuestion}>新增</Button>
          </Col>
          <Col span={5} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={this.passReview}>评审通过</Button>
          </Col>
        </Row>
        <Row style={{ marginTop: "15px" }}>
          <Col span={20} style={{ textAlign: 'left' }}>
            <textarea style={{width: "96%", height: "100%"}}>{this.state.title.review_fail_reason}</textarea>
          </Col>
          <Col span={3} style={{ textAlign: 'left' }}>
            <Button type="primary" onClick={this.notPassReview}>评审不通过</Button>
          </Col>
        </Row>
      </div>
    )
  }
}

export default withApollo(TitleQuestions)
