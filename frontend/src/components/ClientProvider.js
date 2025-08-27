import { createContext, useContext, useState, useEffect, useRef } from "react";
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

  // Use a ref to store the current client state that can be updated without re-registering listeners
  const clientStateRef = useRef();

  // Update the ref whenever state changes
  useEffect(() => {
    clientStateRef.current = {
      // State values
      user,
      characters,
      chronicles,
      members,
      connected,
      sheet,
      // Setters
      setUser: setUser,
      setCharacters: setCharacters,
      setChronicles: setChronicles,
      setMembers: setMembers,
      setConnection: setConnection,
      setSheet: setSheet,
    };
  }, [user, characters, chronicles, members, connected, sheet]);

  // Setup gateway events only once on mount
  useEffect(() => {
    client.handleGatewayEvents(clientStateRef);
  }, []); // Only run once on mount

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
