import { createContext, useContext, useState, useEffect } from "react";
import Client from "../structures/Client";

const ClientContext = createContext(null);
export const useClientContext = () => useContext(ClientContext);

let client = new Client();

export default function ClientProvider({ children }) {
  // Gatway State
  const [user, setUser] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [chronicles, setChronicles] = useState(null);
  const [members, setMembers] = useState(null);
  const [connected, setConnection] = useState(false);
  const [sheet, setSheet] = useState(null);

  useEffect(() => {
    client.handleGatewayEvents({
      setUser: setUser,
      setCharacters: setCharacters,
      setChronicles: setChronicles,
      setMembers: setMembers,
      setConnection: setConnection,
      setSheet: setSheet,
    });
  }, []); // only happens on site load

  const clientContextValue = {
    client,
    connected,
    user,
    characters,
    chronicles,
    members,
    sheet,
    setSheet,
  };

  return (
    <ClientContext.Provider value={clientContextValue}>
      {children}
    </ClientContext.Provider>
  );
}
