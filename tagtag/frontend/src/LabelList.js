import React from 'react';
import {Table, Select, Form, Row, Col, Input, Button, Icon } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
};
const formFields = [{
  title: '语言技能',
  dataIndex: 'skillType',
  type: 'select',
  values: [
    ["TL", "听力"],
    ["YD", "阅读"],
    ["XZ", "写作"],
    ["KY", "口语"]
  ]
}, {
  title: '标签分类',
  dataIndex: 'labelType',
  type: 'select',
  values: [
    ["0", "微技能"],
    ["1", "内容框架"]
  ]
}];



class AdvancedSearchForm extends React.Component {
  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);
    });
  }

  handleReset = () => {
    this.props.form.resetFields();
  }

  // To generate mock Form.Item
  getFields() {
    return formFields.map(f => (
      <Col span={8} style='block'>
        <FormItem
          {...formItemLayout}
          label={f.title}
          hasFeedback
          >
          <Select defaultValue={f.values[0][0]}>
            {f.values.map(o => (<Option value={o[0]}>{o[1]}</Option>))}
          </Select>
        </FormItem>
      </Col>
    ));
  }

  render() {
    return (
      <Form
        className="ant-advanced-search-form"
        onSubmit={this.handleSearch}
      >
        <Row gutter={24}>{this.getFields()}</Row>
        <Row>
          <Col span={4} style={{ textAlign: 'left' }}>
            <Button type="primary">保存</Button>
          </Col>
          <Col span={4} style={{ textAlign: 'left' }}>
            <Button type="primary">删除</Button>
          </Col>
          <Col span={4} style={{ textAlign: 'left' }}>
            <Button type="primary">新增</Button>
          </Col>
          <Col span={4} style={{ textAlign: 'left' }}>
            <Button type="primary">导出明细</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}

const WrappedAdvancedSearchForm = Form.create()(AdvancedSearchForm);


/*
const selectRender = dataIndex => ov => {
  console.log(dataIndex, ov);
  let f = formFields.find(x => x.dataIndex == dataIndex);
  return (
    <Select defaultValue={f.values.find(x => x[0] == ov)[0]} disabled>
      {f.values.map(o => (<Option value={o[0]}>{o[1]}</Option>))}
    </Select>
  );
}*/
const selectRender = dataIndex => ov => {
  let f = formFields.find(x => x.dataIndex == dataIndex);
  return f.values.find(x => x[0] == ov)[1];
};

const handleChangeOfRecord = (record, dataIndex) => ev => {
  console.log(record, dataIndex, ev, ev.target.value);
  record[dataIndex] = ev.target.value;
};


const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  getCheckboxProps: record => ({
    disabled: false 
  }),
};

class ResultEditableList extends React.Component {
  state = {
    data: [
      {"id": "1", "labelName": "l-a", "labelType": "1", "labelLevel": 1, "skillType": "TL"},
      {"id": "2", "labelName": "l-B", "labelType": "1", "labelLevel": 1, "skillType": "TL"},
      {"id": "3", "labelName": "l-c", "labelType": "1", "labelLevel": 1, "skillType": "TL"},
      {"id": "4", "labelName": "l-D", "labelType": "1", "labelLevel": 1, "skillType": "TL"},
    ],
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
      render: (text, record) => {
        console.log(text, record);
        return <Input value={text} onChange={handleChangeOfRecord(record, 'labelName')}/>
      }
    }, {
      title: '二级标签设置',
      dataIndex: 'labelName',
    }]
  }
  render() {
    let {data, columns} = this.state;
    return <Table dataSource={data} columns={columns} rowSelection={rowSelection}
      style={{background: '#fff', padding: '20px 0px' }}
    />;
  }
}



const LabelList = () => (
  <div>
    <WrappedAdvancedSearchForm />
    <div className="search-result-list">
      <ResultEditableList />
    </div>
  </div>
);

export {LabelList, WrappedAdvancedSearchForm};
