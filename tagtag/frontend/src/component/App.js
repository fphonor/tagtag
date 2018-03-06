import React, { Component } from 'react'
import { Layout, Menu, Icon } from 'antd'
import { Switch, Link, Route, Redirect } from 'react-router-dom'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

import TitleList from './TitleList'
import Title from './Title'
import Login from './Login'
import Profile from './Profile'
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
      valid_roles: ['manager', 'default', ],
    }, {
      linkTo: "/labels",
      content: {
        iconType:"flag",
        text: '标签管理'
      },
      valid_roles: ['manager'],
    }, {
      linkTo: "/profile",
      content: {
        iconType:"user",
        text: '个人信息'
      },
      valid_roles: ['default'],
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

    let currentUser = this.props.currentUser
    console.log('currentUser: ', currentUser)

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
            {
              this.state.menus.filter(
                menu => !currentUser.role || menu.valid_roles.find( x => x === currentUser.role.role)
              ).map(
                (menu, i) => (
                <Menu.Item key={i}>
                  <Link to={menu.linkTo}>
                    <Icon type={menu.content.iconType} />
                    <span>{menu.content.text}</span>
                  </Link>
                </Menu.Item>
                )
              )
            }
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
            { this.props.currentUser.token &&
              <div>
                <Switch>
                  <Route exact path="/labels" component={Labels}/>
                  <Route exact path="/labels/:parent_label_id" component={SubLabels}/>
                  <Route exact path="/titles" component={TitleList}/>
                  <Route path="/titles/:title_ident" component={Title}/>
                  <Route path="/login" component={Login}/>
                  <Route exact path="/profile" component={Profile}/>
                  <Redirect to='/titles'/>
                </Switch>
              </div>
            }
            { !this.props.currentUser.token &&
              <Switch>
                <Route path="/login" component={Login}/>
                <Redirect to='/login'/>
              </Switch>
            }
          </Content>
        </Layout>
      </Layout>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  currentUser: state.currentUser,
})

export default withRouter(connect(mapStateToProps)(App))
