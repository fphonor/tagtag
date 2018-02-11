import React from 'react'
import { withRouter } from 'react-router'

import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import { client } from '../graphql'
import { getNewKey } from '../util';

import { Table, Spin, Select, Tooltip, Icon, AutoComplete, Checkbox, Form, Row, Col, Input, Button } from 'antd'
const FormItem = Form.Item
const Option = Select.Option


const handleQuestionFieldChange = (field_name) => (value, record) => {
}

const labels_query_params = (value) => {
  return !!value
  ? {
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          gp_labels (nameLike: $nameLike) {
            id label_name label_level skill_type label_type parent_id
          }
        }
      `,
      variables: { nameLike: value },
    }
  : {
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
    }
  },
  content_level_1: {
    query_params: labels_query_params,
    options_builder: ({data: {gp_labels}}, value, question) => {
      return gp_labels
        .filter(x => x.label_level === 1 && x.label_type === 'NRKJ')
        .map(x => ({value: x.id, text: x.label_name}))
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
      questions: questions.map(x => x === question ? {...x, [dataIndex]: field_value ? parseInt(field_value) : undefined} : x)
    }))
  }
}

const on_search_of_field = (that, dataIndex, question, questions, fieldList) => {
  return (value) => {
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

const oEq = (o1, o2) => {
  let ks1 = Object.keys(o1).filter(k => k !== 'key')
  let ks2 = Object.keys(o2).filter(k => k !== 'key')
  return ks1.length === ks2.length
    && ks1.every(k => ks2.find(k2 => k === k2))
    && ks1.every(k => o1[k] === o2[k])
}

const labelSemanticEq = (x, y) => {
  return ['label_name', 'label_level', 'label_type', 'skill_type'].every(k =>
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
      questions: this.state.questions.map(l => {
        return l.key === label.key ? {...l, [dataIndex]: value } : l
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

  saveQuestions = () => {
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
    this.__getModifiedQuestions()
      .filter(ml => ml.label_name && !!ml.label_name.trim())
      .map(ml => this.__modifyQuestion(ml))
  }

  addQuestion = () => {
    this.setState(({questions, columns}) => {
      let question = {}
      columns.forEach(x => question[x.dataIndex] = "")
      return {
        questions: questions.concat([question])
      }
    })
  }

  addQuestion = () => {
    this.setState(prevState => ({
      questions: prevState.questions.concat(
        [{...this.props.defaultQuestionFields, label_name: "", key: getNewKey()}]
      )
    }))
  }

  removeQuestions = () => {
    let { checked_questions } = this.state
    checked_questions
      && window.confirm('确定要删除这些记录吗？')
      && checked_questions.filter(x => !x.id).map(label => {
           this.setState(({ questions }) => {
             return {
               questions: questions.filter(l => !labelSemanticEq(l, label))
             }
           })
         })
      && checked_questions.filter(x => x.id).map(question => {
          client.mutate({
            mutation: gql`
              mutation DeleteQuestion($id: ID!) {
                delete_question(id: $id) {
                  status
                }
              }
            `,
            variables: question,
          }).then(({ data: { delete_question: { status }}})=> {
            console.log('deleteQuestion: ', status);

            this.setState(({ origin_questions, questions, checked_questions }) => ({
              origin_questions: origin_questions.filter(x => x.id !== question.id),
              questions: questions.filter(x => x.id !== question.id),
              checked_questions: checked_questions.filter(x => x.id !== question.id),
            }))
          })
        })
  }

  exportQuestions = () => {console.log('exportQuestions');}

  __modifyQuestion = (question) => {
    client.mutate({
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
    }).then(({ data: { change_question: { question }}})=> {
      console.log('__modifyQuestion: ', question);
      this.setState(({ originQuestions, questions }) => {
        return {
          originQuestions: originQuestions.find(x => labelSemanticEq(x, question))
            ? originQuestions.map(x => x.id === question.id ? question : x)
            : originQuestions.concat([question]),
          questions: questions.map(x => labelSemanticEq(x, question) ? question : x)
        }
      })
    })
  }

  __getModifiedQuestions = () => {
    let that = this
    return this.getQuestions().filter(x => {
      if (x.id === undefined) {
        return true;
      } else {
        let res = that.state.originQuestions.find(y => {
          return (x.id === y.id && !labelSemanticEq(x, y))
        })
        console.log('res: ', res)
        return !!res
      }
    })
  }
}

class Questions extends QuestionsBase {
  state = {
    questions: [],
    questions_options: [],
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
    let {questions, questions_options, gp_labels} = this.state
    let that = this
    let {columns, column_renders} = this.state
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
          <Button type="primary" onClick={this.addQuestion}>新增</Button>
        </Col>
      </Row>
    </div>
    )
  }
}

class Discourse extends React.Component {
  state = {
    discourse: {},
  }
  constructor (props) {
    super(props)
    let { discourse } = this.props
    this.setState({ discourse })
  }
  componentWillReceiveProps({ discourse }) {
    this.setState({ discourse })
  }
	handleFieldChange() {
	}
  render () {

    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
    };
    const { getFieldDecorator } = this.props.form;
    let { discourse } = this.state
    return (
			<Form onSubmit={this.handleSubmit}>
				<Row>
					<Col span={12} style={{ textAlign: 'right' }}>
						<FormItem
							{...formItemLayout}
							label="语篇编号">
								{discourse.discourse_code}
						</FormItem>
					</Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<FormItem
							{...formItemLayout}
							label={(
								<span>
									领域&nbsp;
									<Tooltip title="What do you want others to call you?">
										<Icon type="question-circle-o" />
									</Tooltip>
								</span>
							)}
							>
							<Select defaultValue={discourse.domain} style={{ width: 120 }} onChange={this.handleFieldChange('domain')}>
								<Option value="教育">教育</Option>
								<Option value="职场">职场</Option>
								<Option value="公共">公共</Option>
								<Option value="个人">个人</Option>
							</Select>
						</FormItem>
					</Col>
				</Row>
				<Row>
					<Col span={12} style={{ textAlign: 'right' }}>
						<FormItem
							{...formItemLayout}
							label="语速"
							>
							<Input defaultValue={discourse.domain} style={{ width: 120 }} onChange={this.handleFieldChange('domain')}/>
						</FormItem>
					</Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<FormItem
							{...formItemLayout}
							label="语速"
							>
							<Select defaultValue={discourse.domain} style={{ width: 120 }} onChange={this.handleFieldChange('domain')}>
								<Option value="快速">快速</Option>
								<Option value="较快">较快</Option>
								<Option value="中速">中速</Option>
								<Option value="较慢">较慢</Option>
								<Option value="慢速">慢速</Option>
							</Select>
						</FormItem>
					</Col>
				</Row>
				<Row>
					<Col span={12} style={{ textAlign: 'right' }}>
						<FormItem
							{...formItemLayout}
							label="素材真实性"
							>
							<Select defaultValue={discourse.domain} style={{ width: 120 }} onChange={this.handleFieldChange('domain')}>
								<Option value="真实语篇">真实语篇</Option>
								<Option value="改编语篇">改编语篇</Option>
							</Select>
						</FormItem>
					</Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<FormItem
							{...formItemLayout}
							label="口音"
							>
							<Select defaultValue={discourse.domain} style={{ width: 120 }} onChange={this.handleFieldChange('domain')}>
								<Option value="澳大利亚">澳大利亚</Option>
								<Option value="美音">美音</Option>
								<Option value="英音">英音</Option>
								<Option value="加拿大">加拿大</Option>
							</Select>
						</FormItem>
					</Col>
				</Row>
				<Row>
					<Col span={12} style={{ textAlign: 'right' }}>
						<FormItem
							{...formItemLayout}
							label="文本体裁"
							>
							<Select defaultValue={discourse.domain} style={{ width: 120 }} onChange={this.handleFieldChange('domain')}>
								<Option value="议论文">议论文</Option>
								<Option value="说明文">说明文</Option>
								<Option value="记叙文">记叙文</Option>
								<Option value="描述文">描述文</Option>
							</Select>
						</FormItem>
					</Col>
					<Col span={12} style={{ textAlign: 'right' }}>
						<FormItem
							{...formItemLayout}
							label="文本类型"
							>
							<Select defaultValue={discourse.domain} style={{ width: 120 }} onChange={this.handleFieldChange('domain')}>
								<Option value="独白">独白</Option>
								<Option value="对话">对话</Option>
								<Option value="讨论">讨论</Option>
							</Select>
						</FormItem>
					</Col>
				</Row>
      </Form>
    )
  }
}

const WrapedDiscoure = Form.create()(Discourse)

class Title extends React.Component {
  state = {
    discourse: {},
    questions: [],
    title_url: "http://www.baidu.com",
  }
  componentDidMount() {
    let {match: {params: {title_ident}}, client} = this.props
    client.query({
      query: gql`
        query GetTitle ($title_ident: String!) {
          gp_title (title_ident: $title_ident) {
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
            discourse {
              id
              discourse_code
              discourse
              ls_domain
              re_domain
              ls_genre
              re_genre
              ls_activity_type
              ls_authenticity
              word_num
              avg_syllable_num
              lemma_num
              family_num
              common_rate
              academic_rate
              ls_audio_type
              ls_audio_all_time
              ls_audio_real_time
              ls_speed
              ls_speed_type
              ls_voice_type
              re_familiarity
              re_is_chart
              sentence_num
              avg_words_per_sent
              re_flesch_kincaid_grade_level
              compound_sent_semantic_exten_num
              compound_sent_adversative_num
              compound_sent_select_num
              noun_clauses_num
              adjectival_clause_num
              adverbial_clauses_num
              discourse_tag_user
              tag_status
              discourse_review_user
              review_status
              review_fail_reason
              ls_speed_syllable
            }
            questions {
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
      variables: {title_ident}
    }).then(({data: {gp_title}}) => {
      this.setState(gp_title);
    })
  }
  render() {
    let {match} = this.props
    let {title_url, discourse, questions} = this.state
    return (
      <Row style={{width: "100%", height: "100%"}}>
        <Col span={24}>
            <h1>{match.params.title_ident}</h1>
          <Questions questions={questions}/>
          <WrapedDiscoure discourse={discourse}/>
        </Col>
      </Row>
    )
  }
}

//        <Col span={12}>
//          <iframe src={title_url} style={{width: "100%", height: "100%"}}/>
//        </Col>
export default withApollo(withRouter(Title))
