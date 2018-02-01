import React from 'react'
import { connect } from 'react-redux'
import { Alert, Table, Row, Col, Input, Button } from 'antd'

import { Link } from 'react-router-dom'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { client } from '../graphql'

import SearchForm from './SearchForm'
import { on_search_of_field, on_change_of_field } from '../actions'

import { getNewKey } from '../util';

const oEq = (o1, o2) => {
  let ks1 = Object.keys(o1).filter(k => k !== 'key')
  let ks2 = Object.keys(o2).filter(k => k !== 'key')
  return ks1.length === ks2.length
    && ks1.every(k => ks2.find(k2 => k === k2))
    && ks1.every(k =>
      k !== 'parent' 
        ? o1[k] === o2[k]
        : ((o1[k] === null && o2[k] === null) || (o1[k].id === o2[k].id))
    )
}

const formFields = [{
  title: '语言技能',
  dataIndex: 'skillType',
  type: 'select',
  options: [
    {value: "TL", text: "听力"},
    {value: "YD", text: "阅读"},
    {value: "XZ", text: "写作"},
    {value: "KY", text: "口语"}
  ]
}, {
  title: '标签分类',
  dataIndex: 'labelType',
  type: 'select',
  options: [
    {value: "WJN", text: "微技能"},
    {value: "NRKJ", text: "内容框架"}
  ]
}]

const selectRender = dataIndex => ov => {
  let f = formFields.find(x => x.dataIndex === dataIndex)
  return f.options.find(x => x.value === ov).text
  // return (
  //   <Select defaultValue={f.values.find(x => x[0] == ov)[0]} disabled>
  //     {f.values.map(o => (<Option value={o[0]}>{o[1]}</Option>))}
  //   </Select>
  // )
}

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
  },
  getCheckboxProps: record => ({
    disabled: false 
  }),
}

class ResultEditableList extends React.Component {
  state = {
    modalVisible: false,
    currentSubLabels: [],
  }
  showSubLabels (label) {
    this.setState({
      modalVisible: true,
      currentSubLabels: label.chld
    })
  }
  hideSubLabels () {
    this.setState({modalVisible: false})
  }
  render() {
    let {labels, columns} = this.props
    //  labels = labels.map((label, i) => ({...label, key: i}))
    return (
      <div>
        <Table dataSource={labels} columns={columns} rowSelection={rowSelection}
          style={{background: '#fff', padding: '20px 0px' }} />
      </div>
    )
  }
}

//         <Modal
//           title="二级标签管理"
//           wrapClassName="vertical-center-modal"
//           visible={this.state.modalVisible}
//           onOk={() => this.hideSubLabels()}
//           onCancel={() => this.hideSubLabels()}>
//           <Table dataSource={this.state.currentSubLabels} columns={getColumns(this.showSubLabels.bind(this))} rowSelection={rowSelection}
//             style={{background: '#fff', padding: '20px 0px' }} />
//         </Modal>

class LabelsBase extends React.Component {

  addLabel = () => {
    this.setState(prevState => ({
      labels: prevState.labels.concat(
        [{...prevState.defaultLabelFields, labelName: "", key: getNewKey()}]
      )
    }))
  }

  __createLabel = (label) => {
    client.mutate({
      mutation: gql`
        mutation CreateLabel(
            $labelName: String!,
            $labelLevel: Int!,
            $labelType: String!,
            $skillType: String!,
            $parentId: Int
          ) {
          createLabel(
            labelName: $labelName
            parentId: $parentId
            labelLevel: $labelLevel
            skillType: $skillType
            labelType: $labelType
          ) {
            label {
              id
              labelName
              parent {
                id
              }
              labelType labelLevel skillType
            }
          }
        }
      `,
      variables: label,
    }).then(({ data: { createLabel: { label }}})=> {
      console.log(label);
      this.setState(({ originLabels, labels }) => {
        return {
          originLabels: originLabels.concat([label]),
          labels: labels.map(x => {
            return x.labelName === label.labelName
              ? {...label, key: x.key}
              : x
          }),
        }
      })
      debugger;
    })
  }
  __modifyLabel = (label) => {
    client.mutate({
      mutation: gql`
        mutation ModifyLabel(
            $id: ID!
            $labelName: String!,
          ) {
          modifyLabel(
            id: $id
            labelName: $labelName
          ) {
            label {
              id
              labelName
              parent {
                id
              }
              labelType labelLevel skillType
            }
          }
        }
      `,
      variables: label,
    }).then(({ data: { modifyLabel: { label }}})=> {
      console.log(label);
      this.setState(({ originLabels }) => {
        return {
          originLabels: originLabels.map(x => x.id === label.id ? label : x)
        }
      })
      debugger;
    })
  }

}

class Labels extends LabelsBase {
  state = {
    defaultLabelFields: {
      labelLevel: 1,
      labelType: "WJN",
      labelName: "",
      parentId: null,
      skillType: 'TL',
    },
    columns: [{
        title: '标签分类',
        dataIndex: 'labelType',
        render: selectRender('labelType') 
      }, {
        title: '语言技能',
        dataIndex: 'skillType',
        render: selectRender('skillType') 
      }, {
        title: '一级标签',
        dataIndex: 'labelName',
      }, {
        title: '二级标签设置',
        dataIndex: 'id',
        render: (text, record) => {
          return (
            <Link to={ "/labels/" + record.id }>
              <Button type="danger" >二级标签管理</Button>
            </Link>
          )
        }
    }],
    originLabels: [],
    labels: [],
  }

  handleChangeOfLabel = ({ label, dataIndex, value }) => {
    this.setState(({ errors={} }) => {
      let vs = {
        [`"${value}" 已经存在了，请使用其它值`]: (this.state.labels.find(x => x[dataIndex] === value && x.id !== label.id)),
        [`不可以使用 "${value}"，请使用其它值`]: (this.state.labels.find(x => x.id && !value)),
      }
      return {
        errors: { ...errors, [ dataIndex + ":" + label.key ]: Object.keys(vs).filter(k => vs[k]) }
      }
    })
    this.setState({
      labels: this.state.labels.map(l => {
        return l.key === label.key ? {...l, [dataIndex]: value } : l
      })
    })
  }

  getColumns = () => {
    const renders = {
      'labelName': (text, label) => {
        return <Input value={text} onChange={({ target: {value} }) => this.setState(state => ({
          labels: this.handleChangeOfLabel({ label, dataIndex: 'labelName', value: value.trim() })
        }))}/>
      }
    }
    return this.state.columns.map(c => (c.render ? c : {...c, render: renders[c.dataIndex]}))
  }

  handleFieldChange = (field, value) => {
    this.setState(state => {
      state.defaultLabelFields[field] = value
      return {
        defaultLabelFields: state.defaultLabelFields
      }
    })
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
      .filter(ml => ml.labelName && !!ml.labelName.trim())
      .map(ml => {
        ml.id ? this.__modifyLabel(ml) : this.__createLabel(ml)
      })
  }
  __getModifiedLabels = () => {
    let that = this
    return this.getLabels().filter(x => {
      if (x.id === undefined) {
        return true;
      } else {
        let res = that.state.originLabels.find(y => {
          return (x.id === y.id && !oEq(x, y))
        })
        console.log('res: ', res)
        return !!res
      }
    })
  }

  removeLabels = () => {console.log('removeLabels');}
  exportLabels = () => {console.log('exportLabels');}

  shouldComponentUpdate(nextProps, nextState) {
    let {apollo: {loading, error, labels}} = this.props
    let {apollo: {loading: loading_n, error: error_n, labels: labels_n}} = nextProps
    return loading !== loading_n
      || error !== error_n
      || labels !== labels_n
      || this.state.labels.length != nextState.labels.length
      || this.state.labels.some(x => nextState.labels.find(y => {
        return (x.id === y.id && !oEq(x, y))
      }))
  }

  getLabels = (data) => {
    let labels = undefined
    if (this.state.labels && this.state.labels.length > 0 ) {
      labels = this.state.labels
    } else {
      labels = data.labels.filter(label => {
        let fs = this.state.defaultLabelFields
        return label.labelLevel === 1 && ['skillType', 'labelType'].every(dataIndex => fs[dataIndex] === label[dataIndex])
      }).map(x => ({...x, key: getNewKey()}))
      this.setState({
        labels,
        originLabels: labels.map(x => ({...x}))
      })
    }
    return labels
  }
  
  render () {
    let { apollo, on_search_of_field, on_change_of_field, searchFormFields } = this.props

		if (apollo && apollo.loading) { return <div>Loading</div> }
		if (apollo && apollo.error) { return <div>Error</div> }

    let labels = this.getLabels(apollo)

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
      <SearchForm 
        formFields={
          searchFormFields.map(f => ({
            ...f,
            defaultValue: this.state.defaultLabelFields[f.dataIndex]
          })).map(f => {
            return f.type === 'select-dynamic'
            ? {...f,
              onChange: on_change_of_field('labels', f.dataIndex),
              onSearch: on_search_of_field('labels', f.dataIndex)}
            : {...f, onChange: this.handleFieldChange,}
          })
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
        <ResultEditableList labels={labels} columns={this.getColumns()}/>
      </div>
    </div>)
  }
}

class SubLabels extends LabelsBase {
  state = {
    defaultLabelFields: {},
    originLabels: [],
    labels: [],
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
      .filter(ml => ml.labelName && !!ml.labelName.trim())
      .map(ml => {
        ml.id ? this.__modifyLabel(ml) : this.__createLabel(ml)
      })
  }
  __getModifiedLabels = () => {
    let that = this
    return this.getLabels().filter(x => {
      if (x.id === undefined) {
        return true;
      } else {
        let res = that.state.originLabels.find(y => {
          return (x.id === y.id && !oEq(x, y))
        })
        console.log('res: ', res)
        return !!res
      }
    })
  }

  removeLabels () {console.log('removeLabels');}
  exportLabels () {console.log('exportLabels');}

  handleChangeOfLabel = ({ label, dataIndex, value }) => {
    this.setState(({ errors={} }) => {
      let vs = {
        [`"${value}" 已经存在了，请使用其它值`]: (this.state.labels.find(x => x[dataIndex] === value && x.id !== label.id)),
        [`不可以使用 "${value}"，请使用其它值`]: (this.state.labels.find(x => x.id && !value)),
      }
      return {
        errors: { ...errors, [ dataIndex + ":" + label.key ]: Object.keys(vs).filter(k => vs[k]) }
      }
    })
    this.setState({
      labels: this.state.labels.map(l => {
        return l.key === label.key ? {...l, [dataIndex]: value } : l
      })
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    let {apollo: {loading, error, labels}} = this.props
    let {apollo: {loading: loading_n, error: error_n, labels: labels_n}} = nextProps
    return loading !== loading_n
      || error !== error_n
      || labels !== labels_n
      || this.state.labels.length != nextState.labels.length
      || this.state.labels.some(x => nextState.labels.find(y => {
        return (x.id === y.id && !oEq(x, y))
      }))
  }

  getLabels = (data, parent_label) => {
    let labels = undefined
    if (this.state.labels && this.state.labels.length > 0 ) {
      labels = this.state.labels
    } else {
      labels = data.labels.filter(label => label.parent && label.parent.id === parent_label.id)
                            .map(x => ({...x, key: getNewKey()}))
      this.setState({
        labels,
        originLabels: labels.map(x => ({...x})),
      })

      if (Object.keys(this.state.defaultLabelFields).length === 0) {
        this.setState({
          defaultLabelFields: {
            labelLevel: parent_label.labelLevel + 1,
            labelType: parent_label.labelType,
            labelName: "",
            parentId: parent_label.id,
            skillType: parent_label.skillType,
          }
        })
      }
    }
    return labels
  }

  render () {
    let {
      apollo,
      match: { params: { parent_label_id } }
    } = this.props

		if (apollo && apollo.loading) { return <div>Loading</div> }
		if (apollo && apollo.error) { return <div>Error</div> }

    let parent_label = apollo.labels.find(l => l.id === parent_label_id)

    let { searchFormFields } = this.props
    let headers = searchFormFields.map(
      field => field.title + ": " + field.options.find(
        o => o.value === parent_label[field.dataIndex]
      ).text
    ).concat(["一级标签: " + parent_label.labelName])

    let labels = this.getLabels(apollo, parent_label)

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
        <ResultEditableList labels={labels} columns={
          [{
            title: '二级标签',
            dataIndex: 'labelName',
            render: (text, label) => (
              <Input value={text} onChange={
                ({target: {value} }) => this.handleChangeOfLabel({label, dataIndex: 'labelName', value: value.trim()})
              }/>
            )
          }]
          }/>
      </div>
    </div>)
  }
}

const mapStateToProps = (state, ownProps) => ({
  searchFormFields: state.searchFormFields.labels
})

const LABELS_QUERY = gql`
  query LabelsQuery {
    labels {
				id
				labelName
				labelType
				skillType
				labelLevel
        parent {
          id
        }
    }
  }
`

const LabelListWithApolloGraphQL = graphql(LABELS_QUERY, { name: 'apollo', fetchPolicy: 'network-only' })(
  connect(
    mapStateToProps,
    { on_search_of_field, on_change_of_field },
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
