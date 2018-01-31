import React from 'react'
import { connect } from 'react-redux'
import {Modal, Table, Row, Col, Input, Button} from 'antd'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import SearchForm from './SearchForm'
import { on_search_of_field, on_change_of_field } from '../actions'

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

const handleChangeOfRecord = (record, dataIndex, records) => value => 
  records.map(x => {
    if (x === record) {
      x[dataIndex] = value
    }
    return x
  })


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
  getSubLabelColumns(buttonAction) {
    return [{
      title: '二级标签',
      dataIndex: 'labelName',
      render: (text, record) => {
        return <Input value={text} onChange={({target}) => this.setState(state => ({
          labels: handleChangeOfRecord(record, 'labelName', state.labels)(target.value)
        }))}/>
      }
    }]
  }
  hideSubLabels () {
    this.setState({modalVisible: false})
  }
  render() {
    let {labels, getColumns} = this.props
    labels = labels.map((label, i) => ({...label, key: i}))
    return (
      <div>
        <Table dataSource={labels} columns={getColumns(this.showSubLabels.bind(this))} rowSelection={rowSelection}
          style={{background: '#fff', padding: '20px 0px' }} />
        <Modal
          title="二级标签管理"
          wrapClassName="vertical-center-modal"
          visible={this.state.modalVisible}
          onOk={() => this.hideSubLabels()}
          onCancel={() => this.hideSubLabels()}>
          <Table dataSource={this.state.currentSubLabels} columns={getColumns(this.showSubLabels.bind(this))} rowSelection={rowSelection}
            style={{background: '#fff', padding: '20px 0px' }} />
        </Modal>
      </div>
    )
  }
}


class LabelList extends React.Component {
  state = {
    fields: {'labelType': "WJN", 'skillType': 'YD'},
    labels: [
      {"id": "1", "labelName": "l-a", "labelType": "WJN", "labelLevel": 1, "skillType": "TL"},
      {"id": "3", "labelName": "l-c", "labelType": "NRKJ", "labelLevel": 1, "skillType": "TL"},
      {"id": "4", "labelName": "l-D", "labelType": "NRKJ", "labelLevel": 1, "skillType": "TL"},
      {"id": "2", "labelName": "l-B", "labelType": "WJN", "labelLevel": 1, "skillType": "YD"},
    ],
    getColumns(buttonAction) {
      return [{
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
        render: (text, record) => {
          return <Input value={text} onChange={({target}) => this.setState(state => ({
            labels: handleChangeOfRecord(record, 'labelName', state.labels)(target.value)
          }))}/>
        }
      }, {
        title: '二级标签设置',
        dataIndex: 'id',
        render: (text, record) => {
          return <Button type="danger" onClick={() => buttonAction(record)}>二级标签管理</Button>
        }
      }]
    }
  }

  handleFieldChange = (field, value) => {
    this.setState(state => {
      state.fields[field] = value
      return {
        fields: state.fields
      }
    })
  }

  addLabel = () => {
    this.setState(state => ({
      labels: state.labels.concat(
        [{...state.fields, labelName: null}]
      )
    }))
  }
  saveLabels () {console.log('saveLabels');}
  removeLabels () {console.log('removeLabels');}
  exportLabels () {console.log('exportLabels');}

  render () {
		if (this.props.apollo && this.props.apollo.loading) { return <div>Loading</div> }

		// 2
		if (this.props.apollo && this.props.apollo.error) { return <div>Error</div> }

    let labels = this.props.apollo.labels.filter(label => {
      let fs = this.state.fields
      return Object.keys(fs).length === 0 || Object.keys(fs).every(f => fs[f] === label[f])
    })

    let { on_search_of_field, on_change_of_field } = this.props

    return (<div>
      <SearchForm 
        formFields={
          this.props.searchFormFields.map(f => ({
            ...f,
            defaultValue: this.state.fields[f.dataIndex]
          })).map(f => {
            return f.type === 'select-dynamic'
            ? {...f,
              onChange: on_change_of_field('labels', f.dataIndex),
              onSearch: on_search_of_field('labels', f.dataIndex)}
            : {
            ...f,
            onChange: this.handleFieldChange,
          }})
        }/>
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
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.exportLabels}>导出明细</Button>
        </Col>
      </Row>
      <div className="search-result-list">
        <ResultEditableList labels={labels} getColumns={this.state.getColumns.bind(this)}/>
      </div>
    </div>)
  }
}

class SubLabels extends React.Component {
  state = {
    fields: {'labelType': "WJN", 'skillType': 'YD'},
    labels: [
      {"id": "1", "labelName": "l-a", "labelType": "WJN", "labelLevel": 1, "skillType": "TL"},
      {"id": "3", "labelName": "l-c", "labelType": "NRKJ", "labelLevel": 1, "skillType": "TL"},
      {"id": "4", "labelName": "l-D", "labelType": "NRKJ", "labelLevel": 1, "skillType": "TL"},
      {"id": "2", "labelName": "l-B", "labelType": "WJN", "labelLevel": 1, "skillType": "YD"},
    ],
    getColumns(buttonAction) {
      return [{
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
        render: (text, record) => {
          return <Input value={text} onChange={({target}) => this.setState(state => ({
            labels: handleChangeOfRecord(record, 'labelName', state.labels)(target.value)
          }))}/>
        }
      }, {
        title: '二级标签设置',
        dataIndex: 'id',
        render: (text, record) => {
          return <Button type="danger" onClick={() => buttonAction(record)}>二级标签管理</Button>
        }
      }]
    }
  }

  handleFieldChange = (field, value) => {
    this.setState(state => {
      state.fields[field] = value
      return {
        fields: state.fields
      }
    })
  }

  addLabel = () => {
    this.setState(state => ({
      labels: state.labels.concat(
        [{...state.fields, labelName: null}]
      )
    }))
  }
  saveLabels () {console.log('saveLabels');}
  removeLabels () {console.log('removeLabels');}
  exportLabels () {console.log('exportLabels');}

  render () {
		if (this.props.apollo && this.props.apollo.loading) { return <div>Loading</div> }

		// 2
		if (this.props.apollo && this.props.apollo.error) { return <div>Error</div> }

    let labels = this.props.apollo.labels.filter(label => {
      let fs = this.state.fields
      return Object.keys(fs).length === 0 || Object.keys(fs).every(f => fs[f] === label[f])
    })

    let { on_search_of_field, on_change_of_field } = this.props

    return (<div>
      <SearchForm 
        formFields={
          this.props.searchFormFields.map(f => ({
            ...f,
            defaultValue: this.state.fields[f.dataIndex]
          })).map(f => {
            return f.type === 'select-dynamic'
            ? {...f,
              onChange: on_change_of_field('labels', f.dataIndex),
              onSearch: on_search_of_field('labels', f.dataIndex)}
            : {
            ...f,
            onChange: this.handleFieldChange,
          }})
        }/>
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
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.exportLabels}>导出明细</Button>
        </Col>
      </Row>
      <div className="search-result-list">
        <ResultEditableList labels={labels} getColumns={this.state.getColumns.bind(this)}/>
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

const LabelListWithApolloGraphQL = graphql(LABELS_QUERY, { name: 'apollo' })(
  connect(
    mapStateToProps,
    { on_search_of_field, on_change_of_field },
  )(LabelList)
)

export {LabelListWithApolloGraphQL as Labels, SubLabels}
