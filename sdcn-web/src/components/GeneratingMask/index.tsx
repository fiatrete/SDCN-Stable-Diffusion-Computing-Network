import React from 'react';
import cx from 'classnames';
import { Typography, Modal, Spin }from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import styles from './index.module.css';        

const { Title } = Typography;

const GeneratingMask = (props:any) => {

  const icon = <LoadingOutlined style={{ fontSize: 36 }} spin />;
  const tip = <Title level={5} style={{}}>Generating...</Title>;

  return (
    <Modal open={props.open} closeIcon={<div></div>} maskClosable={false}
        footer={null} width={148} style={{ height: '140px'}} centered={true}> 
      <Spin className={cx(styles.spin)} tip={tip} indicator={icon} 
          style={{ width: '100px', height: '100px', gap: '24px', padding: '16px 0 0 0'}} />
    </Modal>
  );
}

export default GeneratingMask;