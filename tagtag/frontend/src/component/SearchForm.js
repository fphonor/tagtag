import React from 'react'
import PropTypes from 'prop-types'
import { Spin, Select, Form, Row, Col } from 'antd'
const FormItem = Form.Item
const Option = Select.Option

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
}

class AdvancedSearchForm extends React.Component {
  handleReset () {
    this.props.form.resetFields()
  }

  _getProperContent = (field) => {
    switch (field.type) {
      case 'select':
        return (
          <Select
            defaultValue={field.defaultValue || ""}
            size='small'
            disabled={!!field.disabled}
            onChange={(value) => field.onChange(field.dataIndex, value)} >
            {field.options.map(o => (<Option value={o.value} key={o.value}>{o.text}</Option>))}
          </Select>
          )
      case 'select-dynamic':
        return (
          <Select
            size='small'
            mode="multiple"
            labelInValue
            value={field.value}
            placeholder={field.placeholder || ""}
            notFoundContent={field.fetching ? <Spin size="small" /> : null}
            filterOption={false}
            onSearch={value => field.onSearch(value)}
            onChange={value => field.onChange(value)}
            style={{ width: '100%' }}
            >
            {field.options.map(d => <Option key={d.value}>{d.text}</Option>)}
          </Select>
        )
      case 'text':
        return ': ' + (field.options
          ? field.options.find(o => o.value === field.defaultValue).text
          : field.defaultValue)
      default:
        return "No proper field type"
    }
  }

  getFields = (formFields) => {
    let span = Math.floor(24/formFields.length)
    return formFields.map((f, i) => {
      return (
        <Col span={span} style={{display: "block"}} key={i}>
          <FormItem
            {...formItemLayout}
            label={f.title}
            hasFeedback
          >
            { this._getProperContent(f) }
          </FormItem>
        </Col>
        )
    })
  }

  // To generate mock Form.Item
  render() {
    let { formFields } = this.props
    return (
      <Form
        className="ant-advanced-search-form"
        >
        { Array.isArray(formFields[0])
          ? formFields.map((ffs, i) => <Row gutter={24} key={i}>{this.getFields(ffs)}</Row>)
          : <Row gutter={24}>{this.getFields(formFields)}</Row>
        }
      </Form>
      )
  }
}

AdvancedSearchForm.propTypes = {
  formFields: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        defaultValue: PropTypes.string,
        dataIndex: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        options: PropTypes.arrayOf(PropTypes.shape({
          value: PropTypes.string.isRequired,      
          text: PropTypes.string.isRequired
        })).isRequired,
      }))
    ),
    PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      defaultValue: PropTypes.string,
      dataIndex: PropTypes.string.isRequired,
      onChange: PropTypes.func.isRequired,
      options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,      
        text: PropTypes.string.isRequired
      })).isRequired,
    })),
  ]).isRequired,
}

const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm)

export default WrappedAdvancedSearchForm
