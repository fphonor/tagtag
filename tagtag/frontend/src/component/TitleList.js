import React from 'react'
import { Table, Row, Col, Button } from 'antd'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import SearchForm from './SearchForm'
import { on_search_of_field, on_change_of_field } from '../actions'

const handleFieldChange = (value) => alert(value)


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

  render () {
    let {searchFormFields, on_change_of_field, on_search_of_field} = this.props
    return <div>
      <SearchForm 
        formFields={
          searchFormFields.map(fs =>
            fs.map(f => f).map(f => {
              if (f.type === 'select-dynamic') {
                return {...f,
                   onChange: on_change_of_field('titles', f.dataIndex),
                   onSearch: on_search_of_field('titles', f.dataIndex)}
              }
              return {...f, onChange: on_change_of_field('titles', f.dataIndex), }
            })
          )
        }/>
      <Row>
        <Col span={12}>
        </Col>
        <Col span={4} style={{ textAlign: 'left' }}>
          <Button type="primary" onClick={this.saveLabels}>搜索</Button>
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
  { on_search_of_field, on_change_of_field }
)(withApollo(TitleList))
