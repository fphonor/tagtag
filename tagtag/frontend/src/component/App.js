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
    menus: [{
      linkTo: '/titles',
      content: {
        iconType:"anticon anticon-bars",
        text: '题目标注'
      },
    }, {
      linkTo: "/labels",
      content: {
        iconType:"flag",
        text: '标签管理'
      },
    }],
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    })
  }

  render() {
    let defaultMenu = this.state.menus.find((m, i) => {
      return this.props.location.pathname.startsWith(m.linkTo)
    })
    let defaultSelectedKeys = [this.state.menus.indexOf(defaultMenu).toString()]

    return (
      <Layout style={{height: "100%"}}>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          >
          <Menu theme="dark" mode="inline" defaultSelectedKeys={defaultSelectedKeys}>
            <Menu.Item key={-1}>
              <Link to="/">
                <div className=".App-logo" >
                  <img src={logo} alt="logo"/>
                </div>
              </Link>
            </Menu.Item>
            {this.state.menus.map((menu, i) => (
              <Menu.Item key={i}>
                <Link to={menu.linkTo}>
                  <Icon type={menu.content.iconType} />
                  <span>{menu.content.text}</span>
                </Link>
              </Menu.Item>
            ))}
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
