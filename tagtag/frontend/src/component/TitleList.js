import React from 'react'
import { Row, Col, Button } from 'antd'
import { connect } from 'react-redux'
import SearchForm from './SearchForm'
import { on_search_of_field, on_change_of_field } from '../actions'

const data = []

for (let i = 0; i < 46; i++) {
  data.push({
    key: i,
    name: `Edward King ${i}`,
    age: 32,
    address: `London, Park Lane no. ${i}`,
  })
}


const TitleList = ({searchFormFields, on_change_of_field, on_search_of_field}) => (<div>
      <SearchForm 
        formFields={
          searchFormFields.map(fs =>
            fs.map(f => f).map(f => {
              return f.type === 'select-dynamic'
              ? {...f,
                onChange: on_change_of_field('labels', f.dataIndex),
                onSearch: on_search_of_field('labels', f.dataIndex)}
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

const mapStateToProps = (state, ownProps) => ({
  searchFormFields: state.searchFormFields.titles
})

export default connect(
  mapStateToProps,
  { on_search_of_field, on_change_of_field })(TitleList)
