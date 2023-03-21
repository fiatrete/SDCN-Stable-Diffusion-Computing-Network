import { HomeOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import SdcnNodeList from './components/SdcnNodeList/layout';
import React from 'react';
import './App.css';
import 'antd/dist/reset.css';
const { Sider } = Layout;
const App = () => {

  const menuIconList = [HomeOutlined]
  const menuLabelList = ["SDCN Nodes"]

  const menuItems = menuIconList.map(
    (icon, index) => ({
      key: String(index + 1),
      icon: React.createElement(icon),
      label: menuLabelList[index],
    }))
  return (
    <div className='home'>
      <div className='sidebar'>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => {
            console.log(broken);
          }}
          onCollapse={(collapsed, type) => {
            console.log(collapsed, type);
          }}
        >
          <div className="logo" />
          <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={['1']}
            items={menuItems}
          />
        </Sider>
      </div>
      <div className='main'>
        <div className='header'>
          <h1 className='header-title'>{menuItems[0].label}</h1>
        </div>
        <div className='home-content'>
          <SdcnNodeList></SdcnNodeList>
        </div>
        <div className='footer'></div>
      </div>
    </div>

  );
};
export default App;



