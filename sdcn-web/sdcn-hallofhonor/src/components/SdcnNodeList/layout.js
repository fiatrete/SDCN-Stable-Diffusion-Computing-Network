import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Tag } from "antd";
import './layout.css'

const getData = async () => {
    try{
        const response = await axios.get('https://api.sdcn.info/hallofhonor');
        return formatData(response.data);
    } catch (error){
        console.error(error);
    }
}

const formatData = (oData) => {
    if (oData === '') {
        return null
    }
    let result = []
    const dataArray = oData.trim().split('\n');
    dataArray.forEach((data, key) => {
        const [NodeID, Doner, Handled, WorkLoad] = data.split('|');
        result.push({ key, NodeID, Doner, Handled, WorkLoad })
    });
    return result;
}

const SdcnNodeList = () => {
    const [data, setData] = useState([]);
    const judgeStateFunc = (workload) => {
        let color, status;
        if (parseInt(workload) < 0) {
            color = 'volcano'
            status = 'offline'
        } else if (parseInt(workload) === 0) {
            color = 'green'
            status = 'online'
        } else if (parseInt(workload) > 0) {
            color = 'geekblue'
            status = 'processing'
        }
        return [color, status]
    }
    const columns = [
        {
            title: "Node ID",
            dataIndex: "NodeID",
            key: "Node ID",
            render: (text) => <a href="#{text}" >{text}</a>,
        },
        {
            title: "Donor",
            dataIndex: "Doner",
            key: "Donor",
        },
        {
            title: "Tasks Handledd",
            dataIndex: "Handled",
            key: "Tasks Handledd",
        },
        {
            title: "Current WorkLoad",
            key: "Current WorkLoad",
            dataIndex: "WorkLoad",
            render: (_, { WorkLoad }) => {
                const [color, status] = judgeStateFunc(WorkLoad)
                return (
                    <Tag color={color} key={WorkLoad}>
                        {status}
                    </Tag>
                )
            }
        },
    ];

    useEffect(() => {
        (async () => {
            const data = await getData();
            setData(data);
        })();
    }, [])

    return (
        <div className="base">
            <Table columns={columns} dataSource={data} />
        </div>
    );
};

export default SdcnNodeList;
