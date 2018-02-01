import React from 'react'
import { connect } from 'react-redux'
import { Table, Row, Col, Input, Button } from 'antd'

import { Link } from 'react-router-dom'

import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { client } from '../graphql'

import SearchForm from './SearchForm'
import { on_search_of_field, on_change_of_field } from '../actions'

import { getNewKey } from '../util';

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

class Labels extends React.Component {
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
    this.setState({
      labels: this.state.labels.map(l => {
        return l.key === label.key ? {...l, [dataIndex]: value } : l
      })
    })
  }

  getColumns = () => {
    const renders = {
      'labelName': (text, label) => {
        return <Input value={text} onChange={({ target }) => this.setState(state => ({
          labels: this.handleChangeOfLabel({ label, dataIndex: 'labelName', value: target.value })
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

  addLabel = () => {
    this.setState(state => ({
      labels: state.labels.concat(
        [{...state.defaultLabelFields, labelName: "", key: getNewKey()}]
      )
    }))
  }
  saveLabels () {console.log('saveLabels');}
  removeLabels () {console.log('removeLabels');}
  exportLabels () {console.log('exportLabels');}

  shouldComponentUpdate(nextProps, nextState) {
    let {apollo: {loading, error, labels}} = this.props
    let {apollo: {loading: loading_n, error: error_n, labels: labels_n}} = nextProps
    return loading !== loading_n
      || error !== error_n
      || labels !== labels_n
      || !(this.state.labels.length === 0  && nextState.labels.length > 0)
  }

  initStateInRender = (apollo) => {
    labels = apollo.labels.filter(label => {
      let fs = this.state.defaultLabelFields
      return label.labelLevel === 1 && (Object.keys(fs).length === 0 || Object.keys(fs).every(f => fs[f] === label[f]))
    }).map(x => ({...x, key: getNewKey()}))
    this.setState({ labels })
    this.setState({ originLabels: labels })
  }

  render () {

    let { apollo, on_search_of_field, on_change_of_field, searchFormFields } = this.props

		if (apollo && apollo.loading) { return <div>Loading</div> }
		if (apollo && apollo.error) { return <div>Error</div> }

    let labels = undefined
    if (this.state.labels && this.state.labels.length > 0 ) {
      labels = this.state.labels
    } else {
      labels = apollo.labels.filter(label => {
        let fs = this.state.defaultLabelFields
        return label.labelLevel === 1 && (Object.keys(fs).length === 0 || Object.keys(fs).every(f => fs[f] === label[f]))
      }).map(x => ({...x, key: getNewKey()}))
      this.setState({ labels })
      this.setState({ originLabels: labels })
    }


    return (<div>
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

class SubLabels extends React.Component {
  state = {
    defaultLabelFields: {},
    originLabels: [],
    labels: [],
  }

  saveLabels () {
    this.state.labels.
    // client.mutate({ mutation: gql`
    //   mutation CreateLabel {
    //     createLabel(
    //       labelName: "BrianWang"
    //       parentId: 1
    //       labelLevel: 2
    //       skillType: "TL"
    //       labelType: "WJN"
    //     ) {
    //       label {
    //         labelName
    //         parent {
    //           id
    //         }
    //         labelLevel
    //         skillType
    //         labelType
    //       }
    //     }
    //   }
    // ` }).then(data => {
    //   debugger;
    // })

    console.log('saveLabels');
  }
  removeLabels () {console.log('removeLabels');}
  exportLabels () {console.log('exportLabels');}

  addLabel = () => {
    this.setState(prevState => ({
      labels: prevState.labels.concat(
        [{...prevState.defaultLabelFields, labelName: "", key: getNewKey()}]
      )
    }))
  }

  handleChangeOfLabel = ({ label, dataIndex, value }) => {
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
      || !(this.state.labels.length === 0  && nextState.labels.length > 0)
  }

  render () {
    let {
      apollo,
      match: { params: { parent_label_id } }
    } = this.props

		if (apollo && apollo.loading) { return <div>Loading</div> }
		if (apollo && apollo.error) { return <div>Error</div> }

    let parent_label = apollo.labels.find(l => l.id === parent_label_id)
    let labels = undefined
    if (this.state.labels && this.state.labels.length > 0 ) {
      labels = this.state.labels
    } else {
      labels = apollo.labels.filter(label => label.parent && label.parent.id === parent_label_id)
                            .map(x => ({...x, key: getNewKey()}))
      this.setState({ labels })
      this.setState({ originLabels: labels })

      if (Object.keys(this.state.defaultLabelFields).length === 0) {
        this.setState({
          defaultLabelFields: {
            labelLevel: parent_label.labelLevel + 1,
            labelType: "WJN",
            labelName: "",
            parentId: parent_label.id,
            skillType: parent_label.skillType,
          }
        })
      }
    }

    let { searchFormFields } = this.props
    let headers = searchFormFields.map(
      field => field.title + ": " + field.options.find(
        o => o.value === parent_label[field.dataIndex]
      ).text
    ).concat(["一级标签: " + parent_label.labelName])

    return (<div>
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
                ({target: {value}}) => this.handleChangeOfLabel({label, dataIndex: 'labelName', value})
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
