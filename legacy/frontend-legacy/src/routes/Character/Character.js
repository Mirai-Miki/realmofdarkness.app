import { Outlet } from "react-router-dom";
import Connecting from "../Connecting";
import { useClientContext } from "../../components/ClientProvider";

export default function Character(props) {
  const { connected } = useClientContext();

  const outlet = <Outlet />;
  const loading = <Connecting />;

  let page = outlet;
  if (!connected) page = loading;

  return page;
}
