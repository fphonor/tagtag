import React from 'react'
import { Table, Row, Col, Button, Form, Input } from 'antd'
import { Link } from 'react-router-dom'

import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import SearchForm from './SearchForm'
import { on_search_of_field, on_change_of_field } from '../actions'

import gql from 'graphql-tag'
import { client } from '../graphql'

const FormItem = Form.Item


class TitleList extends React.Component {
  state = {
    data: [],
    columns: [{
        title: '题目编号',
        dataIndex: 'title_ident',
        render: (text, record) => (
          <Link to={"/titles/" + text}>
            <Button type="danger" >{text}</Button>
          </Link>
        )
      }, {
        title: '教材',
        dataIndex: 'tutorial_name',
      }, {
        title: '题目详细路径',
        dataIndex: 'title_detail_path',
      }, {
        title: '语篇标注人',
        dataIndex: 'discourse.discourse_tag_user',
      }, {
        title: '语篇标注状态',
        dataIndex: 'discourse.tag_status',
      }, {
        title: '语篇评审人',
        dataIndex: 'discourse.discourse_review_user',
      }, {
        title: '语篇评审状态',
        dataIndex: 'discourse.review_status',
      }, {
        title: '微技能标注人',
        dataIndex: 'label_tag_user',
      }, {
        title: '微技能标注状态',
        dataIndex: 'label_tag_status',
      }, {
        title: '微技能评审人',
        dataIndex: 'label_review_user',
      }, {
        title: '微技能评审状态',
        dataIndex: 'label_review_status',
    }],
    pagination: {total: 0, current: 0, pageSize: 2},
    variables: {title_info: ""},
    loading: false,
  }

  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState({
      pagination: pager,
    })

    let variables = {...this.state.variables, page_num: pager.current, page_size: pager.pageSize}
    this.setState({variables})
    this.fetch(variables)
  }

  fetch(variables) {
    client.query({
      query: gql`
        query QueryTitles (
          $platform: String!
          $title_type: String!
          $title_course: String!
          $unit_id: String!
          $title_category: String!
          $label_tag_status: String!
          $label_review_status: String!
          $label_tag_user: String!
          $label_review_user: String!
          $discourse_tag_user: String!
          $discourse_review_user: String!
          $skill_level_1: String!
          $skill_level_2: String!
          $content_level_1: String!
          $content_level_2: String!
          $page_num: String!
          $page_size: String!
          $review_status: String!
          $tag_status: String!
          $title_info: String!
        ) {
          gp_titles (
            platform: $platform
            title_type: $title_type
            title_course: $title_course
            unit_id: $unit_id
            title_category: $title_category
            label_tag_status: $label_tag_status
            label_review_status: $label_review_status
            label_tag_user: $label_tag_user
            label_review_user: $label_review_user
            discourse_tag_user: $discourse_tag_user
            discourse_review_user: $discourse_review_user
            skill_level_1: $skill_level_1
            skill_level_2: $skill_level_2
            content_level_1: $content_level_1
            content_level_2: $content_level_2
            page_num: $page_num
            page_size: $page_size
            title_info: $title_info
            tag_status: $tag_status
            review_status: $review_status
          ) {
            page_size
            page_num
            total_num
            titles {
              platform
              title_ident
              tutorial_name
              title_detail_path
              title_info
              title_type
              title_category
              title_url
              minicoz_name
              discourse {
                discourse_code
                tag_status
                discourse_tag_user
                review_status
                discourse_review_user
              }
              label_tag_user
              label_tag_status
              label_review_user
              label_review_status
            }
          }
        }
      `,
      variables,
    }).then(({data, errors}) => {
      if (errors) {
        alert("获取 gp_titles 不成功: " + errors.map(x => x.message))
        console.log('get gp_titles ERROR:', errors)
      } else {
        console.log('get gp_titles OK:', data)
        let {gp_titles: {page_size, page_num, total_num, titles}} = data
        this.setState({
          data: titles,
          pagination: {total: total_num, current: page_num, pageSize: page_size},
        })
      }
    })
  }

  exportTitles() {
    alert("正在开发中....")
  }

  handle_title_info_change= ({target: {value}}) => {
    this.setState(({variables}) => ({variables: {...variables, title_info: value}}))
  }

  showStatistics() {
    alert("正在开发中....")
  }

  searchTitles() {
    let variables = Object.assign(this.state.variables, ...this.props.searchFormFields.map(fs => {
      return Object.assign({}, ...fs.map(f => {
          var val = "";
          if (Array.isArray(f.value)) {
            val = f.value.length === 0 ? val : f.value[0].key
          } else {
            val = f.value ? f.value : val
          }
          return {[f.dataIndex]: val}
        })
      )
    }))
    variables = {...variables, page_num: "1", page_size: "10"}
    this.setState({variables})
    this.fetch(variables)
  }

  render () {
    let {searchFormFields, on_change_of_field, on_search_of_field} = this.props
    const formItemLayout = {
      labelCol: {
        xs: { span: 6 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 16 },
        sm: { span: 16 },
      },
    };
    return <div>
      <SearchForm 
        formFields={
          searchFormFields.map(fs =>
            fs.filter(f => f.show_pred ? f.show_pred(fs) : true).map(f => {
              console.log(f.value)
              if (f.type === 'select-dynamic') {
                return {...f,
                   onChange: on_change_of_field('titles', f.dataIndex, fs),
                   onFocus: on_search_of_field('titles', f.dataIndex, fs),
                   onSearch: on_search_of_field('titles', f.dataIndex, fs)}
              }
              return {...f, onChange: on_change_of_field('titles', f.dataIndex, fs), }
            }).map(f => ({...f, sibling_num: fs.length}))
          )
        }/>
      <Row>
        <Col span={12}>
          <Form>
            <FormItem {...formItemLayout} label="语篇关键字">
              <Input value={this.state.variables.title_info} style={{ width: "100%" }} onChange={this.handle_title_info_change}/>
            </FormItem>
          </Form>
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.searchTitles.bind(this)}>搜索</Button>
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.exportTitles}>导出统计</Button>
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.showStatistics}>统计</Button>
        </Col>
      </Row>
      <div className="search-result-list">
        <Table columns={this.state.columns}
          rowKey={record => record.registered}
          dataSource={this.state.data}
          pagination={this.state.pagination}
          loading={this.state.loading}
          onChange={this.handleTableChange}
        />
      </div>
    </div>
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    searchFormFields: state.searchFormFields.titles
  }
}

export default connect(
  mapStateToProps,
  { on_search_of_field, on_change_of_field}
)(withApollo(TitleList))
