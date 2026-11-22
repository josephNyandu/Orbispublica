import { fetchClientMessages, sendClientMessage } from "@/lib/clientApi";
import { MessageThread } from "@/components/client/MessageThread";

export function ClientMessages() {
  return (
    <>
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Mon conseiller</h1>
      <MessageThread load={fetchClientMessages} send={sendClientMessage} me="client" otherLabel="ORBIS PUBLICA" />
    </>
  );
}
