import { currentTabAtom } from "@/state/atoms";
import { saveToFile } from "@/utils/tabs";
import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import { useLoaderData } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { useContext } from "react";
import { useStore } from "zustand";
import { TreeStateContext } from "../common/TreeStateContext";

function ConfirmChangesModal({
  opened,
  toggle,
  closeTab,
}: {
  opened: boolean;
  toggle: () => void;
  closeTab: () => void;
}) {
  const [currentTab, setCurrentTab] = useAtom(currentTabAtom);
  const store = useContext(TreeStateContext);
  const storeSave = store !== null ? useStore(store, (s) => s.save) : () => {};
  const { documentDir } = useLoaderData({ from: "/" });

  function save() {
    const { root, headers } = JSON.parse(
      sessionStorage.getItem(currentTab?.value || "") || "{}",
    );
    saveToFile({
      dir: documentDir,
      setCurrentTab,
      tab: currentTab,
      headers,
      root,
      markAsSaved: () => storeSave(),
    });
  }

  return (
    <Modal withCloseButton={false} opened={opened} onClose={toggle}>
      <Stack>
        <div>
          <Text fz="lg" fw="bold" mb={10}>
            Unsaved Changes
          </Text>
          <Text>
            You have unsaved changes. Do you want to save them before closing?
          </Text>
        </div>

        <Group justify="right">
          <Button
            variant="default"
            onClick={() => {
              closeTab();
              toggle();
            }}
          >
            Close Without Saving
          </Button>
          <Button
            onClick={() => {
              save();
              closeTab();
              toggle();
            }}
          >
            Save and Close
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ConfirmChangesModal;
