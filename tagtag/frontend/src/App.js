import React, { Component } from 'react';
import { Layout, Menu, Icon } from 'antd';
// import { TitleList } from './TitleList';
import { LabelList } from './LabelList';

import 'antd/dist/antd.css';
import logo from './logo.svg';
import './App.css';

const { Header, Content, Sider } = Layout;


class App extends Component {
  state = {
    collapsed: false,
  };
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  render() {
    return (
			<Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="flag" />
              <span>标签管理</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="video-camera" />
              <span>题目标注</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: '0px 15px' }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
          </Header>
          <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
            <LabelList/>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default App;
