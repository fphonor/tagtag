import React from 'react'
import { Row, Col, Button } from 'antd'
import { connect } from 'react-redux'
import SearchForm from './SearchForm'
import { on_search_of_field, on_change_of_field } from '../actions'


const TitleList = ({searchFormFields, on_change_of_field, on_search_of_field}) => (<div>
      <SearchForm 
        formFields={
          searchFormFields.map(fs =>
            fs.map(f => f).map(f => {
              return f.type === 'select-dynamic'
              ? {...f,
                onChange: on_change_of_field('titles', f.dataIndex),
                onSearch: on_search_of_field('titles', f.dataIndex)}
              : {
              ...f,
              onChange: this.handleFieldChange,
            }})
          )
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
      </div>
    </div>)

TitleList.handleFieldChange = (value) => alert(value)

const mapStateToProps = (state, ownProps) => {
  return {
    searchFormFields: state.searchFormFields.titles
  }
}

export default connect(
  mapStateToProps,
  { on_search_of_field, on_change_of_field }
)(TitleList)
