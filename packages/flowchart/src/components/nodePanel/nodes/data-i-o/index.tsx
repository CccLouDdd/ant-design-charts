import React, { useContext } from 'react';
import { NsGraphConfig } from '@ali/xflow-core';
import { AppContext } from '../../index';
import { createPath } from '../../util';
import { NODE_WIDTH, NODE_HEIGHT, NODE_PADDING } from '../../constants';

export const DataIONode: NsGraphConfig.INodeRender = (props) => {
  const { size = { width: NODE_WIDTH, height: NODE_HEIGHT }, data } = props;
  const {
    theme: { NodeConfig, LabelConfig },
  } = useContext(AppContext) as any;
  const stateNodeConfig = NodeConfig?.normal;
  const stateLabelConfig = LabelConfig?.normal;
  const { width, height } = size;

  const slope = height / 2; // 用于计算斜率 tan(&) =  slope / height

  const path = [
    ['M', slope - NODE_PADDING, NODE_PADDING], // top-left
    ['L', width - 2 * NODE_PADDING, NODE_PADDING], // top-right
    ['L', width - slope, height - 2 * NODE_PADDING], // bottom-right
    ['L', NODE_PADDING, height - 2 * NODE_PADDING], // bottom-left
    ['Z'],
  ];

  return (
    <svg width={width} height={height}>
      <path d={createPath(path)} fill={stateNodeConfig.fill} stroke={stateNodeConfig.stroke} />
      <text
        x={width / 2}
        y={height / 2}
        fill={stateLabelConfig.fill}
        textAnchor="middle"
        alignmentBaseline="middle"
      >
        {data?.label}
      </text>
      Sorry, your browser does not support inline SVG.
    </svg>
  );
};