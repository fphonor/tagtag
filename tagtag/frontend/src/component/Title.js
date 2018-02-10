import React from 'react'
import { withRouter } from 'react-router'

import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'

import { Select, Tooltip, Icon, AutoComplete, Checkbox, Form, Row, Col, Input, Button } from 'antd'
const FormItem = Form.Item
const Option = Select.Option


const handleQuestionFieldChange = (field_name) => (value, record) => {
}

const labels_query_params = (value) => {
  return !!value
  ? {
      query: gql`
        query OptionsQuery ($nameLike: String!) {
          labels (nameLike: $nameLike) {
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
    options_builder: (response, value, fieldList) => {
      return response.data.labels
        .filter(x => x.label_level === 1 && x.label_type === 'WJN')
        .map(x => ({value: x.id, text: x.label_name}))
    }
  },
  skill_level_2: {
    query_params: labels_query_params,
    options_builder: (response, value, fieldList) => {
      return response.data.labels
        .filter(x => x.label_level === 2 && x.label_type === 'WJN')
        .map(x => ({value: x.id, text: x.label_name, parent_id: x.parent_id}))
        .filter(x => {
          let skill_level_1 = fieldList.find(x => x.dataIndex === 'skill_level_1')
          return skill_level_1.value ? skill_level_1.value.find(y => y.key === x.parent_id) : true
        })
    }
  },
  content_level_1: {
    query_params: labels_query_params,
    options_builder: (response) => {
      return response.data.labels
        .filter(x => x.label_level === 1 && x.label_type === 'NRKJ')
        .map(x => ({value: x.id, text: x.label_name}))
    }
  },
  content_level_2: {
    query_params: labels_query_params,
    options_builder: (response, value, fieldList) => {
      return response.data.labels
        .filter(x => x.label_level === 2 && x.label_type === 'NRKJ')
        .map(x => ({value: x.id, text: x.label_name, parent_id: x.parent_id}))
        .filter(x => {
          let content_level_1= fieldList.find(x => x.dataIndex === 'content_level_1')
          return content_level_1.value ? content_level_1.value.find(y => y.key === x.parent_id) : true
        })
    }
  },
}


class Labels extends LabelsBase {
  state = {
    columns: [{
        title: "问题序号",
        dataIndex: 'question_index',
        render: (text, record) => <Input value={text} onChange={handleQuestionFieldChange('label_type')}/>
      }, {
        title: "微技能一级标签",
        dataIndex: 'skill_level_1',
        render: selectRender('skill_level_1') 
      }, {
        title: "微技能二级标签",
        dataIndex: 'skill_level_2',
        render: selectRender('skill_level_2') 
      }, {
        title: "内容一级标签",
        dataIndex: 'content_level_1',
        render: selectRender('content_level_1') 
      }, {
        title: "内容二级标签",
        dataIndex: 'content_level_2',
        render: selectRender('content_level_2') 
    }],
    originLabels: [],
    gp_labels: [],
  }

  getColumns = () => {
    const renders = {
      'label_name': (text, label) => {
        return <Input value={text} onChange={({ target: {value} }) => this.setState(state => ({
          gp_labels: this.handleChangeOfLabel({ label, dataIndex: 'label_name', value: value.trim() })
        }))}/>
      }
    }
    return this.state.columns.map(c => (c.render ? c : {...c, render: renders[c.dataIndex]}))
  }

  handleFieldChange = (field, update_label_search_field) =>  value => {
    update_label_search_field({[field]: value })
    // this.setState(state => {
    //   return {
    //     defaultLabelFields: { ...state.defaultLabelFields, [field]: value }
    //   }
    // })
  }

  shouldComponentUpdate(nextProps, nextState) {
    let {apollo: {loading, error, gp_labels}} = this.props
    let {apollo: {loading: loading_n, error: error_n, gp_labels: labels_n}} = nextProps
    return loading !== loading_n
      || error !== error_n
      || gp_labels !== labels_n
      || this.props.defaultLabelFields !== nextProps.defaultLabelFields
      || this.state.gp_labels.length !== nextState.gp_labels.length
      || this.state.gp_labels.some(o => nextState.gp_labels.find(n => {
        return (o.id === n.id && !labelSemanticEq(o, n)) || (!o.id && n.id)
      }))
  }

  getLabels = (data) => {
    let gp_labels = undefined
    if (this.state.gp_labels && this.state.gp_labels.length > 0 ) {
      gp_labels = this.state.gp_labels
    } else {
      gp_labels = data.gp_labels.map(x => ({...x, key: getNewKey()}))
      this.setState({
        gp_labels,
        originLabels: gp_labels.map(x => ({...x}))
      })
    }
    let { defaultLabelFields } = this.props
    return gp_labels.filter(label => {
      return label.label_level === 1
        && ['skill_type', 'label_type'].every(dataIndex => defaultLabelFields[dataIndex] === label[dataIndex])
    })
  }
  
  render () {
    let { apollo, on_search_of_field, on_change_of_field, searchFormFields } = this.props
    if (apollo && apollo.loading) { return <div>Loading</div> }
    if (apollo && apollo.error) { return <div>Error</div> }

    let gp_labels = this.getLabels(apollo)

    let { errors } = this.state
    let { defaultLabelFields } = this.props
    console.log("errors: " + errors)

    return (<div>
      {
        errors
        && Object.keys(errors).some(k => errors[k].length > 0)
        && Object.keys(errors)
                 .filter(k => errors[k].length > 0)
                 .map(k => errors[k].map((msg, i) => <Alert key={`${k}:${i}`} type="error" message={msg} banner />))
      }
      <SearchForm 
        formFields={
          searchFormFields.map(f => ({
            ...f,
            defaultValue: defaultLabelFields[f.dataIndex]
          })).map(f => {
            return f.type === 'select-dynamic'
            ? {...f,
              onChange: on_change_of_field('gp_labels', f.dataIndex),
              onSearch: on_search_of_field('gp_labels', f.dataIndex)}
            : {...f, onChange: this.handleFieldChange(f.dataIndex, this.props.update_label_search_field),}
          }).map(f => ({...f, sibling_num: searchFormFields.length}))
        }/>
      <Row>
        <Col span={5} style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={this.saveLabels}>保存</Button>
        </Col>
        <Col span={5} style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={this.removeLabels}>删除</Button>
        </Col>
        <Col span={5} style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={this.addLabel}>新增</Button>
        </Col>
        <Col span={5} style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={this.exportLabels}>导出明细</Button>
        </Col>
      </Row>
      <div className="search-result-list">
        <ResultEditableList gp_labels={gp_labels} columns={this.getColumns()} rowSelection={this.rowSelection}/>
      </div>
    </div>)
  }
}

class Questions extends React.Component {
  state = {
    questions: []
    origin_questions: []
  }
  on_change_of_field(dataIndex) {
    that = this
    return (value, record) => {
      this.setState(state => ({
        questions: state.questions.map(x => x.key === record.key ? {...x, [dataIndex]: value} : x)
      }))
    }
  }

  on_search_of_field(dataIndex) {
    that = this
    return value => {
      console.log('on_search_of_field', fieldList, listName, dataIndex, value)
      let action = {
        type: QUESTION_FIELD_ON_SEARCH,
        listName,
        dataIndex,
        value,
      }
      dispatch(action)
      client.query(
        SEARCH_CONF[listName][dataIndex].query_params(value)
      ).then(response => {
        dispatch({
          ...action,
          type: FIELD_SEARCH_FINISHED,
          options: SEARCH_CONF[listName][dataIndex].options_builder(response, value, fieldList),
        })
      })
    }
  }
  selectRender(field_name) => (value, record) => {
    
  }
  render () {
    return <div>
      Questions
    </div>
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
        <Col span={12}>
          <iframe src={title_url} style={{width: "100%", height: "100%"}}/>
        </Col>
        <Col span={12}>
            <h1>{match.params.title_ident}</h1>
          <WrapedDiscoure discourse={discourse}/>
          <Questions questions={questions}/>
        </Col>
      </Row>
    )
  }
}

export default withApollo(withRouter(Title))
