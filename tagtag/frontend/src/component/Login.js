import React, { Component } from 'react'
// import { AUTH_TOKEN } from '../constant'
import { Button, Input, Form, Row, Col } from 'antd'
const FormItem = Form.Item

class Login extends Component {
  state = {
    login: true,
    email: '',
    password: '',
    name: '',
  }
  _login = async () => {
  }

  _register = async () => {
  }
  render = () => (
    <Form
      className="ant-advanced-search-form"
      onSubmit={this.handleSearch}
    >
      <Row gutter={24}>
        { !this.state.login &&
          <Col span={8} style={{display: "block"}} key={2}>
            <FormItem label="用户名" >
              <Input onChange={({target}) => this.setState({name: target.value})}/>
            </FormItem>
          </Col>
        }
      </Row>
      <Row gutter={24}>
        <Col span={8} style={{display: "block"}} key={3}>
          <FormItem label="邮箱" >
            <Input onChange={({target}) => this.setState({email: target.value})}/>
          </FormItem>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={8} style={{display: "block"}} key={4}>
          <FormItem label="密码" >
            <Input onChange={({target}) => this.setState({password: target.value})}/>
          </FormItem>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={8} style={{display: "block"}} key={5}>
          <Button type="primary" onClick={this._confirm}>{ this.state.login ? "登录" : "注册" }</Button>

        </Col>
      </Row>
    </Form>
  )
}

export default Login;
