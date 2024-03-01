import { useMutation, useQuery, useQueryClient } from "react-query";
import { supabase } from "./supabase.ts";
import {
  BaseProjectTypeSupabase,
  SectionTypeSupabase,
  TaskSupabase,
} from "./ProjectTypes.ts";

async function fetchProjectsQueryFn() {
  const { data, error } = await supabase
    .from("Projects")
    .select("*")
    .order("CreatedAt", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useFetchProjects() {
  return useQuery<BaseProjectTypeSupabase[], Error>(["Projects"], () =>
    fetchProjectsQueryFn(),
  );
}
async function fetchSectionQueryFn(projectId: string) {
  const { data, error } = await supabase
    .from("Sections of Projects")
    .select("*")
    .eq("ProjectRef", projectId)
    .order("SectionCreatedAt", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export function useFetchSectionOfProject(projectId: string) {
  return useQuery<SectionTypeSupabase[], Error>(
    ["Sections of Projects", projectId],
    () => fetchSectionQueryFn(projectId),
  );
}
async function fetchTaskQueryFn(SectionRef: string) {
  const { data, error } = await supabase
    .from("Tasks of each Section")
    .select("*")
    .eq("SectionRef", SectionRef);
  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function useFetchTasksOfSection(SectionRef: string) {
  return useQuery<TaskSupabase[], Error>(
    ["Tasks of each Section", SectionRef],
    () => fetchTaskQueryFn(SectionRef),
  );
}
async function postNewProjectQueryFn(newProject: BaseProjectTypeSupabase) {
  const { data, error } = await supabase
    .from("Projects")
    .insert([newProject])
    .select();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
export function usePostNewProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newProject: BaseProjectTypeSupabase) =>
      postNewProjectQueryFn(newProject),
    onSuccess: () => {
      queryClient
        .invalidateQueries(["Projects"])
        .then(() => console.log("Projects query invalidated and refetched"));
    },
  });
}
async function postNewSectionQueryFn(newSection: SectionTypeSupabase) {
  const { data, error } = await supabase
    .from("Sections of Projects")
    .insert(newSection)
    .select();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
export function usePostNewSection(onSuccessCallback?: () => void) {
  return useMutation({
    mutationFn: (newSection: SectionTypeSupabase) =>
      postNewSectionQueryFn(newSection),
    onSuccess: () => {
      if (onSuccessCallback) onSuccessCallback();
    },
  });
}
async function postNewTaskSetQueryFn(newTask: TaskSupabase[]) {
  const { data, error } = await supabase
    .from("Tasks of each Section")
    .insert(newTask)
    .select();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
export function usePostNewTaskSet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTaskSet: TaskSupabase[]) =>
      postNewTaskSetQueryFn(newTaskSet),
    onSuccess: () => {
      queryClient
        .invalidateQueries(["Sections of Projects"])
        .then(() => console.log("Sections query invalidated and refetched"));
      queryClient
        .invalidateQueries(["Tasks of each Section"])
        .then(() => console.log("Sections query invalidated and refetched"));
    },
  });
}

async function deleteAllWithRefQueryFn(
  ReferenceId: string,
  table: string,
  eqColumn: string,
) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq(eqColumn, ReferenceId);
  if (error) {
    throw new Error(error.message);
  }
}
async function deleteAllWithMultipleRefsQueryFn(
  ReferenceId: string[],
  table: string,
  eqColumn: string,
) {
  const { error } = await supabase
    .from(table)
    .delete()
    .in(eqColumn, ReferenceId);
  if (error) {
    throw new Error(error.message);
  }
}
export function useDeleteAllWithRef({
  onSuccessCallback,
  table,
}: {
  onSuccessCallback?: () => void;
  table: string;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ReferenceId,
      table,
      eqColumn,
    }: {
      ReferenceId: string | string[];
      table: string;
      eqColumn: string;
    }) => {
      if (typeof ReferenceId === "string")
        return deleteAllWithRefQueryFn(ReferenceId, table, eqColumn);
      else
        return deleteAllWithMultipleRefsQueryFn(ReferenceId, table, eqColumn);
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries([table])
        .then(() => console.log("delete all" + " successfully"));
      if (onSuccessCallback) onSuccessCallback();
    },
  });
}

async function editTaskQueryFn(TaskId: string, textEdit: string) {
  const { error } = await supabase
    .from("Tasks of each Section")
    .update({ Task: textEdit })
    .eq("TaskId", TaskId);
  if (error) throw new Error(error.message);
}
export function useEditTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ TaskId, textEdit }: { TaskId: string; textEdit: string }) =>
      editTaskQueryFn(TaskId, textEdit),
    onSuccess: () =>
      queryClient
        .invalidateQueries(["Tasks of each Section"])
        .then(() => console.log("Edited successfully")),
  });
}
async function editSectionQueryFn(
  Id: string,
  textEdit: string,
  columnTitle: string,
  selectionTable: string,
  eqColumn: string,
) {
  const { error } = await supabase
    .from(selectionTable)
    .update({ [columnTitle]: textEdit })
    .eq(eqColumn, Id);
  if (error) throw new Error(error.message);
}
export function useEditSection(selectionTable: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      Id,
      textEdit,
      columnTitle,
      selectionTable,
      eqColumn,
    }: {
      Id: string;
      textEdit: string;
      columnTitle: string;
      selectionTable: string;
      eqColumn: string;
    }) =>
      editSectionQueryFn(Id, textEdit, columnTitle, selectionTable, eqColumn),
    onSuccess: () =>
      queryClient
        .invalidateQueries([selectionTable])
        .then(() => console.log("Edited successfully")),
  });
}
