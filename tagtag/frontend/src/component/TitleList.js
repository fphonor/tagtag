import React from 'react'
import { Table, Row, Col, Button } from 'antd'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import SearchForm from './SearchForm'
import { field_options_clean, on_search_of_field, on_change_of_field } from '../actions'

import gql from 'graphql-tag'
import { client } from '../graphql'

const handleFieldChange = (value) => {
  debugger
}


class TitleList extends React.Component {
  state = {
    data: [],
    pagination: {total: 0, current: 0, pageSize: 2},
    loading: false,
  }

	handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState({
      pagination: pager,
    })
    this.fetch({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    })
  }

  fetch = (params = {}) => {
    //  console.log('params:', params);
    //  this.setState({ loading: true });
		//  let {client} = this.props
    //  client.query({
    //    url: 'https://randomuser.me/api',
    //    method: 'get',
    //    data: {
    //      results: 10,
    //      ...params,
    //    },
    //    type: 'json',
    //  }).then((data) => {
    //    const pagination = { ...this.state.pagination };
    //    // Read total count from server
    //    // pagination.total = data.totalCount;
    //    pagination.total = 200;
    //    this.setState({
    //      loading: false,
    //      data: data.results,
    //      pagination,
    //    });
    //  });
  }

  componentDidMount() {
    this.fetch();
  }

  searchTitles() {
    let res = Object.assign({}, ...this.props.searchFormFields.map(fs => {
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
    client.query({
      query: gql`
        query QueryTitles(
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
          titles(
            platform: $platform
            titleType: $title_type
            titleCourse: $title_course
            unitId: $unit_id
            titleCategory: $title_category
            labelTagStatus: $label_tag_status
            labelReviewStatus: $label_review_status
            labelTagUser: $label_tag_user
            labelReviewUser: $label_review_user
            discourseTagUser: $discourse_tag_user
            discourseReviewUser: $discourse_review_user
            skillLevel1: $skill_level_1
            skillLevel2: $skill_level_2
            contentLevel1: $content_level_1
            contentLevel2: $content_level_2
            pageNum: $page_num
            pageSize: $page_size
            titleInfo: $title_info
            tagStatus: $tag_status
            reviewStatus: $review_status
          ) {
            platform
            titleIdent
            titleType
            titleCategory
            titleUrl
            discourseCode
            labelTagUser
            labelTagStatus
            labelReviewUser
            labelReviewStatus
          }
        }
      `,
      variables: {...res,
        page_num: "3",
        page_size: "3",
        review_status: "",
        tag_status: "",
        title_info: "",
      }
    }).then(({data: {titles}}) => {
      debugger
    })
  }

  render () {
    let {searchFormFields, field_options_clean, on_change_of_field, on_search_of_field} = this.props
    return <div>
      <SearchForm 
        formFields={
          searchFormFields.map(fs =>
            fs.filter(f => f.show_pred ? f.show_pred(fs) : true).map(f => {
              console.log(f.value)
               // onFocus: field_options_clean('titles', f.dataIndex, fs),
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
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.searchTitles.bind(this)}>搜索</Button>
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.removeLabels}>导出统计</Button>
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.addLabel}>统计</Button>
        </Col>
      </Row>
      <div className="search-result-list">
				<Table columns={[]}
					rowKey={record => record.registered}
				  size="middle"
					dataSource={this.state.data}
					pagination={this.state.pagination}
					loading={this.state.loading}
					onChange={this.handleTableChange}
				/>
      </div>
    </div>
  }
}

TitleList.handleFieldChange = (value) => alert(value)

const mapStateToProps = (state, ownProps) => {
  return {
    searchFormFields: state.searchFormFields.titles
  }
}

export default connect(
  mapStateToProps,
  { on_search_of_field, on_change_of_field, field_options_clean}
)(withApollo(TitleList))
