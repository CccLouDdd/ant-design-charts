import { createToolbarConfig } from '@ali/xflow-extension';
import {
  XFlowNodeCommands,
  XFlowGraphCommands,
  ContextServiceConstant,
  ContextRegistry,
  ContextServiceUtils,
  NsGraph,
} from '@ali/xflow-core';
import { NsGraphCmd } from '@ali/xflow-core/es/command-contributions/interface';
import { IToolbarItemProps } from '@ali/xflow-core/es/toolbar/interface';
import { ICommandConfig } from '@ali/xflow-core/es/command/interface';
import { getProps } from '../../util';
import { CommandPool } from './constants';

export namespace TOOLBAR_ITEMS {
  export const BACK_NODE = XFlowNodeCommands.BACK_NODE.id;
  export const FRONT_NODE = XFlowNodeCommands.FRONT_NODE.id;
  export const SAVE = XFlowGraphCommands.SAVE_GRAPH_DATA.id;
  export const REDO = `${XFlowGraphCommands.REDO_CMD.id}`;
  export const UNDO = `${XFlowGraphCommands.UNDO_CMD.id}`;
}

export const useToolbarConfig = createToolbarConfig((toolbarConfig) => {
  const {
    config = [
      {
        command: CommandPool.REDO_CMD,
        text: '重做',
      },
      {
        command: CommandPool.UNDO_CMD,
        text: '撤销',
      },
      {
        command: CommandPool.FRONT_NODE,
        text: '置前',
      },
      {
        command: CommandPool.BACK_NODE,
        text: '置后',
      },
      {
        command: CommandPool.SAVE_GRAPH_DATA,
        text: '保存',
      },
    ],
  } = getProps('toolbarConfig') ?? {};

  const getIconName = (commandName: string) => {
    if (!Object.values(CommandPool).includes(commandName)) {
      console.warn(`unknown command: ${commandName}`);
      return {};
    }
    return config.find(
      (item: { command: string; iconName: string }) => item.command === commandName,
    );
  };

  /** 生产 toolbar item */
  toolbarConfig.setToolbarItemRegisterFn((registry) => {
    /** 撤销 */
    registry.registerToolbarItem({
      ...getIconName(CommandPool.UNDO_CMD),
      id: TOOLBAR_ITEMS.UNDO,
      command: TOOLBAR_ITEMS.UNDO,
      cmdOptions: async () => ({} as ICommandConfig<NsGraphCmd.UndoCmd.IArgs>),
      useContext: async (ctxService: ContextRegistry, setState: any) => {
        const ctx = await ctxService.useContext<ContextServiceConstant.COMMAND_UNDOABLE.IState>(
          ContextServiceConstant.COMMAND_UNDOABLE.id,
        );
        ctx.onDidChange((bool) => {
          setState((state: IToolbarItemProps) => {
            state.isEnabled = bool;
          });
        });
      },
    });

    /** 重做 */
    registry.registerToolbarItem({
      ...getIconName(CommandPool.REDO_CMD),
      id: TOOLBAR_ITEMS.REDO,
      command: TOOLBAR_ITEMS.REDO,
      cmdOptions: async () => ({} as ICommandConfig<NsGraphCmd.RedoCmd.IArgs>),
      useContext: async (ctxService: ContextRegistry, setState: any) => {
        const ctx = await ctxService.useContext<ContextServiceConstant.COMMAND_REDOABLE.IState>(
          ContextServiceConstant.COMMAND_REDOABLE.id,
        );
        ctx.onDidChange((bool) => {
          setState((state: IToolbarItemProps) => {
            state.isEnabled = bool;
          });
        });
      },
    });

    /** 保存数据 */
    registry.registerToolbarItem({
      ...getIconName(CommandPool.SAVE_GRAPH_DATA),
      id: TOOLBAR_ITEMS.SAVE,
      command: TOOLBAR_ITEMS.SAVE,
      /** cmdOptions 返回的是 command执行的入参 */
      cmdOptions: async (item, contextService) => {
        return {
          args: {
            saveGraphDataService: (meta, graphData) => {
              const onSaveData = getProps('onSaveData');
              if (onSaveData) {
                onSaveData(graphData);
              }
            },
          },
        } as ICommandConfig<NsGraphCmd.SaveGraphData.IArgs>;
      },
      useContext: async (ctxService, setState) => {
        /** 有meta数据才显示可用 */
        const ctx = await ctxService.useContext<ContextServiceConstant.GRAPH_META.IState>(
          ContextServiceConstant.GRAPH_META.id,
        );
        const meta = await ctx.getValidValue();

        if (meta.flowId) {
          setState((state) => {
            state.isEnabled = true;
          });
        }
        ctx.onDidChange((data) => {
          setState((state) => {
            state.isEnabled = true;
          });
        });
      },
    });

    /** 前置 */
    registry.registerToolbarItem({
      ...getIconName(CommandPool.FRONT_NODE),
      id: TOOLBAR_ITEMS.FRONT_NODE,
      command: TOOLBAR_ITEMS.FRONT_NODE,
      cmdOptions: async (item, contextService) => {
        const { data } = await ContextServiceUtils.useSelectedNode<NsGraph.INodeConfig>(
          contextService,
        );
        const nodeId = data?.id || '-1';
        return {
          args: {
            nodeId,
          },
        };
      },
      useContext: async (ctxService, setState) => {
        const ctx = await ctxService.useContext<ContextServiceConstant.SELECTED_NODES.IState>(
          ContextServiceConstant.SELECTED_NODES.id,
        );
        ctx.onDidChange((nodes) => {
          setState((state) => {
            state.isEnabled = nodes.length > 0;
          });
        });
      },
    });

    /** 后置 */
    registry.registerToolbarItem({
      ...getIconName(CommandPool.BACK_NODE),
      id: TOOLBAR_ITEMS.BACK_NODE,
      command: TOOLBAR_ITEMS.BACK_NODE,
      cmdOptions: async (item, contextService) => {
        const { data } = await ContextServiceUtils.useSelectedNode<NsGraph.INodeConfig>(
          contextService,
        );
        const nodeId = data?.id || '-1';
        return {
          args: {
            nodeId,
          },
        };
      },
    });
  });

  // 动态设置 toolbar
  toolbarConfig.setOptions({
    mainGroups: [
      {
        items: config.map((item: { command: string }) => `xflow:${item.command}`),
      },
    ],
  });
});
