import React from 'react'
import { connect } from 'react-redux'
import { Alert, Table, Row, Col, Input, Button } from 'antd'

import { Link } from 'react-router-dom'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { client } from '../graphql'

import SearchForm from './SearchForm'
import { update_label_search_field, on_search_of_field, on_change_of_field } from '../actions'

import { getNewKey } from '../util';

const labelSemanticEq = (x, y) => {
  return ['label_name', 'label_level', 'label_type', 'skill_type'].every(k =>
    x[k] === y[k]
  )
}

const formFields = [{
  title: '语言技能',
  dataIndex: 'skill_type',
  type: 'select',
  options: [
    {value: "TL", text: "听力"},
    {value: "YD", text: "阅读"},
    {value: "XZ", text: "写作"},
    {value: "KY", text: "口语"}
  ]
}, {
  title: '标签分类',
  dataIndex: 'label_type',
  type: 'select',
  options: [
    {value: "WJN", text: "微技能"},
    {value: "NRKJ", text: "内容框架"}
  ]
}]

const selectRender = dataIndex => ov => {
  let f = formFields.find(x => x.dataIndex === dataIndex)
  return f.options.find(x => x.value === ov).text
}

const ResultEditableList = ({ gp_labels, columns, rowSelection}) => (
  <div>
    <Table dataSource={gp_labels} columns={columns} rowSelection={rowSelection}
      style={{background: '#fff', padding: '20px 0px' }} />
  </div>
)

class LabelsBase extends React.Component {
  handleChangeOfLabel = ({ label, dataIndex, value }) => {
    this.setState(({ errors={}, gp_labels=[], }) => {
      let vs = {
        [`"${value}" 已经存在了，请使用其它值`]: (gp_labels.find(x => x[dataIndex] === value && x.id !== label.id)),
        [`不可以使用 "${value}"，请使用其它值`]: (gp_labels.find(x => x.id && !value)),
      }
      return {
        errors: { ...errors, [ dataIndex + ":" + label.key ]: Object.keys(vs).filter(k => vs[k]) }
      }
    })
    this.setState({
      gp_labels: this.state.gp_labels.map(l => {
        return l.key === label.key ? {...l, [dataIndex]: value } : l
      })
    })
  }

  rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      this.setState({
        checkedLabels: selectedRows
      })
    },
    getCheckboxProps: record => ({
      disabled: false 
    }),
  }

  saveLabels = () => {
    console.log('saveLabels...');

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
    this.__getModifiedLabels()
      .filter(ml => ml.label_name && !!ml.label_name.trim())
      .map(ml => this.__modifyLabel(ml))
  }

  removeLabels = () => {
    let that = this
    const onSuccess = ({ delete_label: { status }}, label) => {
      console.log('delete_label: ', status);

      that.props.apollo.gp_labels = that.props.apollo.gp_labels.filter(l => l.id !== label.id)

      that.setState(({ originLabels, gp_labels }) => {
        return {
          originLabels: originLabels.filter(l => l.id !== label.id),
          gp_labels: gp_labels.filter(l => l.id !== label.id),
          checkedLabels: [],
        }
      })
    }
    this.state.checkedLabels
      && window.confirm('确定要删除这些标签吗？')
      // eslint-disable-next-line
      && this.state.checkedLabels.filter(x => !x.id).map(label => {
           this.setState(({ gp_labels }) => {
             return {
               gp_labels: gp_labels.filter(l => !labelSemanticEq(l, label))
             }
           })
         })
      // eslint-disable-next-line
      && this.state.checkedLabels.filter(x => x.id).map(label => {
          client.mutate({
            mutation: gql`
              mutation DeleteLabel($id: Int!) {
                delete_label(id: $id) {
                  status
                }
              }
            `,
            variables: label,
          }).then(({ data, errors})=> {
            if (!errors && data) {
              onSuccess(data, label)
            } else {
              console.log('login ERROR: ', errors);
              alert('请先删除该标签下的子标签');
            }
          })
        })
  }

  __createLabel = (label) => {
    client.mutate({
      mutation: gql`
        mutation CreateLabel(
            $label_name: String!,
            $label_level: Int!,
            $label_type: String!,
            $skill_type: String!,
            $parent_id: Int
          ) {
          createLabel(
            label_name: $label_name
            parent_Id: $parent_id
            label_level: $label_level
            skill_type: $skill_type
            label_type: $label_type
          ) {
            label {
              id
              label_name
              parent_id
              label_type label_level skill_type
            }
          }
        }
      `,
      variables: label,
    }).then(({ data: { createLabel: { label }}})=> {
      console.log('__createLabel: ', label);
      this.setState(({ originLabels, gp_labels }) => {
        this.props.apollo.gp_labels = this.props.apollo.gp_labels.concat([label])
        return {
          originLabels: originLabels.concat(
            gp_labels.filter(x => labelSemanticEq(x, label))
                  .map(x => ({...x, id: label.id}))
          ),
          gp_labels: gp_labels.map(x => labelSemanticEq(x, label) ? {...x, id: label.id} : x),
        }
      })
    })
  }

  __modifyLabel = (_label) => {
    client.mutate({
      mutation: gql`
        mutation ModifyLabel(
            $id: Int
            $label_name: String!,
            $label_level: Int!,
            $label_type: String!,
            $skill_type: String!,
            $parent_id: Int
          ) {
          change_label(
            id: $id
            label_name: $label_name
            label_level: $label_level
            label_type: $label_type
            skill_type: $skill_type
            parent_id: $parent_id
          ) {
            label {
              id
              label_name
              parent_id
              label_type
              label_level
              skill_type
            }
          }
        }
      `,
      variables: _label,
    }).then(({ data: { change_label: { label }}})=> {
      console.log('__modifyLabel: ', label);
      this.setState(({ originLabels, gp_labels }) => {
        return {
          originLabels: _label.id ? originLabels.map(x => x.id === label.id ? label : x) : originLabels.concat([label]),
          gp_labels: gp_labels.map(x => labelSemanticEq(x, label) ? {...x, id: label.id} : x),
        }
      })
    })
  }

  __getModifiedLabels = () => {
    let that = this
    return this.getLabels().filter(x => {
      if (x.id === undefined) {
        return true;
      } else {
        let res = that.state.originLabels.find(y => {
          return (x.id === y.id && !labelSemanticEq(x, y))
        })
        console.log('res: ', res)
        return !!res
      }
    })
  }
}

class Labels extends LabelsBase {
  state = {
    columns: [{
        title: '标签分类',
        dataIndex: 'label_type',
        render: selectRender('label_type') 
      }, {
        title: '语言技能',
        dataIndex: 'skill_type',
        render: selectRender('skill_type') 
      }, {
        title: '一级标签',
        dataIndex: 'label_name',
      }, {
        title: '二级标签设置',
        dataIndex: 'id',
        render: (text, record) => {
          return text === undefined ? "----" : (
            <Link to={ "/labels/" + record.id }>
              <Button type="danger" >二级标签管理</Button>
            </Link>
          )
        }
    }],
    originLabels: [],
    gp_labels: [],
  }

  _get_variables() {
    return {
      skill_type: this.props.defaultLabelFields.skill_type,
      label_type: this.props.defaultLabelFields.label_type,
    }
  }

  exportLabels = () => {
    window.open("/export/labels/?query_params=" + encodeURIComponent(JSON.stringify(this._get_variables())), "_blank")
  }

  addLabel = () => {
    this.setState(({gp_labels}) => {
      let { defaultLabelFields } = this.props
      return {
        gp_labels: gp_labels.concat(
          [{...defaultLabelFields, label_name: "", key: getNewKey()}]
        )
      }
    })
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
    this.setState(state => {
      return {
        defaultLabelFields: { ...state.defaultLabelFields, [field]: value }
      }
    })
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
    }).sort((x, y) => x.id - y.id)
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
            defaultValue: defaultLabelFields[f.dataIndex],
            value: defaultLabelFields[f.dataIndex]
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

class SubLabels extends LabelsBase {
  state = {
    defaultLabelFields: {},
    originLabels: [],
    gp_labels: [],
  }

  shouldComponentUpdate(nextProps, nextState) {
    let {apollo: {loading, error, gp_labels}} = this.props
    let {apollo: {loading: loading_n, error: error_n, gp_labels: labels_n}} = nextProps
    return loading !== loading_n
      || error !== error_n
      || gp_labels !== labels_n
      || this.state.gp_labels.length !== nextState.gp_labels.length
      || this.state.gp_labels.some(o => nextState.gp_labels.find(n => {
        return (o.id === n.id && !labelSemanticEq(o, n)) || (!o.id && n.id)
      }))
  }

  addLabel = () => {
    this.setState(({gp_labels, defaultLabelFields}) => {
      defaultLabelFields = defaultLabelFields || this.props.defaultLabelFields
      return {
        gp_labels: gp_labels.concat(
          [{...defaultLabelFields, label_name: "", key: getNewKey()}]
        )
      }
    })
  }

  getLabels = (data, parent_label) => {
    let gp_labels = undefined
    if (this.state.gp_labels && this.state.gp_labels.length > 0 ) {
      gp_labels = this.state.gp_labels
    } else {
      gp_labels = data.gp_labels
        .filter(label => label.parent_id === parent_label.id)
        .map(x => ({...x, key: getNewKey()}))
        .sort((x, y) => x.id - y.id)
      this.setState({
        gp_labels,
        originLabels: gp_labels.map(x => ({...x})),
      })

      if (Object.keys(this.state.defaultLabelFields).length === 0) {
        this.setState({
          defaultLabelFields: {
            label_level: parent_label.label_level + 1,
            label_type: parent_label.label_type,
            label_name: "",
            parent_id: parent_label.id,
            skill_type: parent_label.skill_type,
          }
        })
      }
    }
    return gp_labels
  }

  render () {
    let {
      apollo,
      match: { params: { parent_label_id } }
    } = this.props

    if (apollo && apollo.loading) { return <div>Loading</div> }
    if (apollo && apollo.error) { return <div>Error</div> }

    let parent_label = apollo.gp_labels.find(l => l.id === parseInt(parent_label_id, 10))

    let { searchFormFields } = this.props
    let headers = searchFormFields.map(
      field => field.title + ": " + field.options.find(
        o => o.value === parent_label[field.dataIndex]
      ).text
    ).concat(["一级标签: " + parent_label.label_name])

    console.log('this.getLabels: before ', this.state.gp_labels)
    let gp_labels = this.getLabels(apollo, parent_label)
    console.log('this.getLabels: after ', gp_labels)

    let { errors } = this.state
    console.log("errors: " + errors)

    return (<div>
      {
        errors
        && Object.keys(errors).some(k => errors[k].length > 0)
        && Object.keys(errors)
                 .filter(k => errors[k].length > 0)
                 .map(k => errors[k].map(msg => <Alert type="error" message={msg} banner />))
      }
      <Row style={{margin: "15px"}}>
        {
          headers.map((x, i) =>
            (
              <Col span={24/headers.length} style={{ textAlign: 'left' }} key={i}>
                {x} 
              </Col>
            )
          )
        }
      </Row>
      <Row>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.saveLabels}>保存</Button>
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.removeLabels}>删除</Button>
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.addLabel}>新增</Button>
        </Col>
      </Row>
      <div className="search-result-list">
        <ResultEditableList gp_labels={gp_labels} columns={
          [{
            title: '二级标签',
            dataIndex: 'label_name',
            render: (text, label) => (
              <Input value={text} onChange={
                ({target: {value} }) => this.handleChangeOfLabel({label, dataIndex: 'label_name', value: value.trim()})
              }/>
            )
          }]
          } rowSelection={this.rowSelection}/>
      </div>
    </div>)
  }
}

const mapStateToProps = (state, ownProps) => ({
  searchFormFields: state.searchFormFields.gp_labels,
  defaultLabelFields: state.defaultLabelSearchFields,
})

const LABELS_QUERY = gql`
  query LabelsQuery {
    gp_labels {
        id
        label_name
        label_type
        skill_type
        label_level
        parent_id
    }
  }
`

const LabelListWithApolloGraphQL = graphql(LABELS_QUERY, { name: 'apollo', fetchPolicy: 'network-only' })(
  connect(
    mapStateToProps,
    { on_search_of_field, on_change_of_field, update_label_search_field },
  )(Labels)
)

const SubLabelListWithApolloGraphQL = graphql(LABELS_QUERY, { name: 'apollo', fetchPolicy: 'network-only' })(
  connect(
    mapStateToProps,
    { on_search_of_field, on_change_of_field },
  )(SubLabels)
)

export {
  LabelListWithApolloGraphQL as Labels,
  SubLabelListWithApolloGraphQL as SubLabels,
}
