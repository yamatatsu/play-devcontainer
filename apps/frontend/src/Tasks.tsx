import { useQuery } from "@tanstack/react-query";
import * as API from "./api";
import QueryKeys from "./query-keys";

export default function Tasks() {
  const query = useQuery({
    queryKey: QueryKeys.taskList(),
    queryFn: API.getTasks,
  });

  switch (query.status) {
    case "pending":
      return "Loading...";
    case "error":
      return <>Error: {String(query.error)}</>;
    case "success":
      return <div>{JSON.stringify(query.data)}</div>;
  }
}
