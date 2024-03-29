import {
  Card,
  CardActionArea,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

import { useState } from "react";
import { TaskSupabase } from "../../utils/ProjectTypes.ts";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  useDeleteAllWithRef,
  useEditTask,
} from "../../utils/UseQueryHookSupabase.ts";
import PopoverTaskEditor from "./PopoverTaskEditor.tsx";

const SingleTaskComponent = ({ Task, State, TaskId }: TaskSupabase) => {
  const [taskState, setTaskState] = useState(State);
  const {
    isError,
    mutate: deleteTask,
    error,
  } = useDeleteAllWithRef({ table: "Tasks of each Section" });
  const { mutate: updateTask } = useEditTask();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: TaskId });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  function handleDeleteTask() {
    deleteTask({
      ReferenceId: TaskId,
      table: "Tasks of each Section",
      eqColumn: "TaskId",
    });
  }
  function handleChangeState() {
    setTaskState(!taskState);
    updateTask({ TaskId, Edit: !taskState });
  }
  if (isError) {
    console.log(error);
  }

  return (
    <Card
      elevation={0}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <Stack
        spacing={2}
        direction={"row"}
        p={0.5}
        m={0.5}
        alignItems={"center"}
      >
        <CardActionArea onClick={handleChangeState} sx={{ py: 0.7 }}>
          <Stack spacing={1} direction={"row"} alignItems={"center"} px={1}>
            {taskState ? <CheckCircleIcon /> : <CheckCircleOutlineIcon />}
            <Typography
              variant={"h6"}
              pl={2}
              sx={{ textDecoration: !taskState ? "" : "line-through" }}
            >
              {Task}
            </Typography>
          </Stack>
        </CardActionArea>
        <PopoverTaskEditor TaskId={TaskId} taskValue={Task} />
        <IconButton onClick={handleDeleteTask}>
          <DeleteIcon fontSize="medium" />
        </IconButton>
      </Stack>
    </Card>
  );
};

export default SingleTaskComponent;
