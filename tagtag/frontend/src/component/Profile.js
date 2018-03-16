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

class Profile extends Component {
  state = {}

  _modify_user() {
    let register_user_info = this.state.current_user
    register_user_info = {...register_user_info, role: JSON.stringify({
      role: register_user_info.role,
      discourse_role: register_user_info.discourse_role,
      skill_role: register_user_info.skill_role,
    })}
    let {setCurrentUser} = this.props
    this.props.client.mutate({
      mutation: gql`
        mutation ModifyUser(
          $id: Int!
          $username: String!,
          $password: String,
          $email: String!,
          $role: String
        ) {
          modify_user(
            id: $id
            username: $username,
            password: $password,
            email: $email,
            role: $role
          ) {
            modified_user {
              id
              email
              username
              role
              token
            }
          }
        }
      `,
      variables: register_user_info,
    }).then(({ data, errors})=> {
      if (!errors && data) {
        let user = data.modify_user.modified_user
        setCurrentUser({...user, role: JSON.parse(user.role)})
        alert('修改用户信息成功')
      } else {
        alert('修改用户信息失败: ' + errors.map(x => x.message))
      }
    })
  }

  componentWillReceiveProps({ currentUser}) {
    this.setState({ current_user: {...currentUser, ...currentUser.role}})
  }

  componentDidMount() {
    this.props.client.query({
      query: gql`
        query getCurrentUser {
          me {
            id
            email
            username
            role
            token
          }
        }
      `,
    }).then(({data, errors}) => {
      if (!errors) {
        let user = data.me;
        let currentUser = {...user, role: JSON.parse(user.role)}
        this.setState({ current_user: {...currentUser, ...currentUser.role}})
        this.props.setCurrentUser(currentUser)
      }
    })
  }
  _logout () {
    this.props.clearCurrentUser({})
  }
  _set_discourse_role({target: {value}}) {
    this.setState(state => ({
      current_user: {...state.current_user, discourse_role: value}
    }))
  }
  _set_skill_role({target: {value}}) {
    this.setState(state => ({
      current_user: {...state.current_user, skill_role: value}
    }))
  }
  render() {
    let current_user = this.state.current_user || {}
    console.log('current_user: ', current_user)
    return <div>
      <Row gutter={24}>
        <Col span={8}>
          <Button onClick={() => this.props.history.go(-1)}>返回最近访问的页面</Button>
        </Col>
        <Col span={16}>
          <Button onClick={this._logout.bind(this)}>退出系统</Button>
        </Col>
      </Row>

      <Form className="ant-advanced-search-form">
        <Row gutter={24}>
          <h2 className="mv3">修改用户信息</h2>
        </Row>
        <Row gutter={24}>
          <Col span={8} style={{display: "block"}} key={3}>
            <FormItem label="邮箱" >
              <Input value={current_user.email} onChange={({target: {value}}) => this.setState(state => ({
                current_user: {...state.current_user, email: value}
              }))}/>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8} style={{display: "block"}} key={4}>
            <FormItem label="密码" >
              <Input value={current_user.password} onChange={({target: {value}}) => this.setState(state => ({
                current_user: {...state.current_user, password: value}
              }))} type="password" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8} style={{display: "block"}} key={4}>
            <FormItem label="语篇标注角色" >
              <select
                value={current_user.discourse_role}
                onChange={this._set_discourse_role.bind(this)}
                style={{ width: '100%' }}
                >
                <option value="">---</option>
                <option value="discourse_tagger">标注人</option>
                <option value="discourse_reviewer">审批人</option>
              </select>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={8} style={{display: "block"}} key={4}>
            <FormItem label="微技能标注角色" >
              <select
                value={current_user.skill_role}
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
            <Button type="primary" onClick={this._modify_user.bind(this)}>保存</Button>
          </Col>
        </Row>
      </Form>
    </div>
  }
}

const mapStateToProps = (state, ownProps) => ({
  currentUser: state.currentUser,
})

export default withRouter(withApollo(connect(mapStateToProps, {setCurrentUser, clearCurrentUser})(Profile)));
