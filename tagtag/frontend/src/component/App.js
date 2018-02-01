import React, { Component } from 'react'
import { Layout, Menu, Icon } from 'antd'
import { Switch, Link, Route, Redirect } from 'react-router-dom'
import { withRouter } from 'react-router'
import TitleList from './TitleList'
import Login from './Login'
import { Labels, SubLabels } from './Labels'

import 'antd/dist/antd.css'
import logo from './logo.svg'
import './App.css'

const { Header, Content, Sider } = Layout


class App extends Component {
  state = {
    collapsed: true,
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }
  render() {
    return (
      <Layout style={{height: "100%"}}>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          >
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="0">
              <Link to="/">
                <div className=".App-logo" >
                  <img src={logo} alt="logo"/>
                </div>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/titles">
                <Icon type="anticon anticon-bars" />
                <span>题目标注</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="1">
              <Link to="/labels">
                <Icon type="flag" />
                <span>标签管理</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: '0px 15px' }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}/>
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            <Switch>
              <Route exact path="/labels" component={Labels}/>
              <Route exact path="/labels/:parent_label_id" component={SubLabels}/>
              <Route path="/titles" component={TitleList}/>
              <Route path="/login" component={Login}/>
              <Redirect to='/titles'/>
            </Switch>
          </Content>
        </Layout>
      </Layout>
    )
  }
}

export default withRouter(App)
