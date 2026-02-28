"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Dialog } from "./ui/dialog";

export type StateDialogModal = {
  id: string;
  content: ReactNode;
  open: boolean;
  onCloseCallback?: () => void;
};

export type TriggerType = (state: StateDialogModal[]) => void;

export enum ActionType {
  OPEN_DIALOG = 0,
  CLOSE_DIALOG = 1,
  CLOSE_ALL_DIALOG = 2,
}

let memoryState: StateDialogModal[] = [];
let trigger: TriggerType | null = null;

const reducer = (
  state: StateDialogModal[],
  action: {
    type: ActionType;
    payload?: Partial<StateDialogModal & { quantity?: number }>;
  }
): StateDialogModal[] => {
  switch (action.type) {
    case ActionType.OPEN_DIALOG:
      return [
        ...state,
        {
          id: action.payload!.id!,
          content: action.payload!.content!,
          onCloseCallback: action.payload?.onCloseCallback,
          open: true,
        },
      ];
    case ActionType.CLOSE_DIALOG: {
      if (action.payload?.quantity) {
        return state.slice(action.payload.quantity);
      }
      if (action.payload?.id) {
        const item = state.find((modal) => modal.id === action.payload?.id);
        if (item?.onCloseCallback) {
          item.onCloseCallback();
        }
        return state.filter((modal) => modal.id !== action.payload?.id);
      }
      const lastItem = state[state.length - 1];
      if (lastItem?.onCloseCallback) {
        lastItem.onCloseCallback();
      }

      return state.slice(0, -1);
    }
    case ActionType.CLOSE_ALL_DIALOG:
      return [];
    default:
      return state;
  }
};

const dispatch = (action: { type: ActionType; payload?: Partial<StateDialogModal & { quantity?: number }> }) => {
  memoryState = reducer(memoryState, action);
  if (trigger) {
    trigger(memoryState);
  }
};

export const modal = {
  show: (props: { id?: string; content: ReactNode; onCloseCallback?: () => void }) => {
    const id = props.id || `modal-${Date.now()}`;

    dispatch({
      type: ActionType.OPEN_DIALOG,
      payload: {
        id,
        content: props.content,
        onCloseCallback: props.onCloseCallback,
      },
    });

    return id;
  },
  close: (props?: { id?: string; callback?: () => void; quantity?: number }) => {
    dispatch({
      type: ActionType.CLOSE_DIALOG,
      payload: { id: props?.id, quantity: props?.quantity },
    });
    if (props?.callback) {
      props.callback();
    }
  },
  closeAll: (props?: { callback?: () => void }) => {
    dispatch({
      type: ActionType.CLOSE_ALL_DIALOG,
    });
    if (props?.callback) {
      props.callback();
    }
  },
};

export const useStore = () => {
  const [store, setStore] = useState(memoryState);

  useEffect(() => {
    trigger = setStore;

    return () => {
      memoryState = [];
    };
  }, []);

  return { store };
};

export const ModalContainer = () => {
  const { store } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    modal.closeAll();
  }, [pathname]);

  return (
    <>
      {store.map((modalState) => (
        <Dialog
          key={modalState.id}
          modal
          onOpenChange={(open) => {
            if (!open) {
              modal.close({ id: modalState.id });
              if (modalState.onCloseCallback) {
                modalState.onCloseCallback();
              }
            }
          }}
          open={modalState.open}
        >
          {modalState.content}
        </Dialog>
      ))}
    </>
  );
};
