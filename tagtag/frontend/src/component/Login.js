import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'
import { withApollo } from 'react-apollo'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import gql from 'graphql-tag'
import { setCurrentUser, clearCurrentUser } from '../actions'
import { Button, Input, Form, Row, Col, Select } from 'antd'
const FormItem = Form.Item
const Option = Select.Option

class Login extends Component {
  state = {
    login: true,
    email: '',
    password: '',
    username: '',
  }

  _login() {
    this.props.client.mutate({
      mutation: gql`
        mutation Login($username: String!, $password: String!) {
          login(username: $username, password: $password) {
            current_user {
              id
              username
              role
              email
              token
            }
            jwt_token
          }
        }
      `,
      variables: this.state,
    }).then(({ data, errors })=> {
      if (!errors && data) {
        let { login: { current_user, jwt_token }} = data
        console.log('login OK: ', current_user)
        this.props.setCurrentUser({...current_user, role: JSON.parse(current_user.role)}, jwt_token)
        this.setState({login: false})
      } else {
        alert('登录失败: ' + errors.map(x => x.message));
        console.log('login ERROR: ', errors);
      }
    })
  }

  _add_user() {
    let register_user_info = this.state
    register_user_info = {...register_user_info, role: JSON.stringify({
      discourse_role: register_user_info.discourse_role,
      skill_role: register_user_info.skill_role,
      role: 'default',
    })}
    this.props.client.mutate({
      mutation: gql`
        mutation Register(
          $username: String!,
          $password: String!,
          $email: String!,
          $role: String!
        ) {
          create_user(
            username: $username,
            password: $password,
            email: $email,
            role: $role
          ) {
            created_user {
              username
              email
              role
            }
          }
        }
      `,
      variables: register_user_info,
    }).then(({ data, errors})=> {
      if (!errors && data) {
        alert('添加用户成功: ' + data.status)
      } else {
        alert('添加用户失败: ' + errors.map(x => x.message))
      }
    })
  }

  _toggleLoginState = () => {
    this.setState(
      ({login}) => ({login: !login})
    )
  }
  componentDidMount() {
    this.props.client.query({
      query: gql`
        query getCurrentUser {
          me {
            username
            role
            token
          }
        }
      `,
    }).then(({data, errors}) => {
      if (!errors) {
        let user = data.me;
        let current_user = {...user, role: JSON.parse(user.role)}
        this.props.setCurrentUser(current_user)
      }
    })
  }
  _logout () {
    this.props.clearCurrentUser()
  }
  _set_discourse_role(opt) {
    let key = opt.key
    this.setState({discourse_role: key});
  }
  _set_skill_role(opt) {
    let key = opt.key
    this.setState({skill_role: key});
  }
  render() {
    if (this.props.currentUser && this.props.currentUser.token) {
      return <div>
        { this.props.currentUser.role.role === 'manager' &&
        <Form className="ant-advanced-search-form">
          <Row gutter={24}>
            <h2 className="mv3">添加新用户</h2>
          </Row>
          <Row gutter={24}>
            <Col span={8} style={{display: "block"}} key={3}>
              <FormItem label="邮箱" >
                <Input onChange={({target: {value}}) => this.setState({email: value})}/>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8} style={{display: "block"}} key={2}>
              <FormItem label="用户名" >
                <Input onChange={({target: {value}}) => this.setState({username: value})}/>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8} style={{display: "block"}} key={4}>
              <FormItem label="密码" >
                <Input onChange={({target: {value}}) => this.setState({password: value})} type="password" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8} style={{display: "block"}} key={4}>
              <FormItem label="语篇标注角色" >
                <select
                  onChange={this._set_discourse_role.bind(this)}
                  style={{ width: '100%' }}
                  >
                  <option value="">---</option>
                  <option value="discourse_tagger">标注人</option>
                  <option value="discourse_reviewer">审批人</option>
                </select>
              </FormItem>
            </Col>
            <Col span={8} style={{display: "block"}} key={4}>
              <FormItem label="微技能标注角色" >
                <select
                  onChange={this._set_skill_role.bind(this)}
                  style={{ width: '100%' }}
                  >
                  <option value="">---</option>
                  <option value="skill_tagger">标注人</option>
                  <option value="skill_reviewer">审批人</option>
                </select>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8} style={{display: "block", textAlign: 'right'}} key={5}>
              <Button type="primary" onClick={this._add_user.bind(this)}>添加新用户</Button>
            </Col>
          </Row>
        </Form>
        }
        { this.props.currentUser.role.role !== 'manager' && <Redirect to="titles"/> }
      </div>
    } else {
      return (
        <Form
          className="ant-advanced-search-form"
        >
          <Row gutter={24}>
            <h4 className="mv3">{this.state.login ? '登录' : '注册'}</h4>
          </Row>
          <Row gutter={24}>
            { !this.state.login &&
              <Col span={8} style={{display: "block"}} key={3}>
                <FormItem label="邮箱" >
                  <Input onChange={({target: {value}}) => this.setState({email: value})}/>
                </FormItem>
              </Col>
            }
          </Row>
          <Row gutter={24}>
            <Col span={8} style={{display: "block"}} key={2}>
              <FormItem label="用户名" >
                <Input onChange={({target: {value}}) => this.setState({username: value})}/>
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8} style={{display: "block"}} key={4}>
              <FormItem label="密码" >
                <Input onChange={({target: {value}}) => this.setState({password: value})} type="password" />
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={4} style={{display: "block", textAlign: 'right'}} key={5}>
            </Col>
            <Col span={3} style={{display: "block", textAlign: 'right'}} key={5}>
              <Button type="primary" onClick={this.state.login ? this._login.bind(this) : this._add_user.bind(this)}>{ this.state.login ? "登录" : "注册" }</Button>
            </Col>
          </Row>
        </Form>
      )
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  currentUser: state.currentUser,
})

export default withRouter(withApollo(connect(mapStateToProps, {setCurrentUser, clearCurrentUser})(Login)));
