import { Ticket, TicketMessage } from '../../types/index';

const GET_TICKETS_KEY = 'nexus_support_tickets';
const GET_MESSAGES_KEY_PREFIX = 'nexus_support_messages_';

const getStoredTickets = (): Ticket[] => {
  try {
    const raw = localStorage.getItem(GET_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [
      {
        id: "ticket_demo_1",
        userId: "demo-user",
        userName: "Demo Partner",
        userRole: "RESELLER",
        subject: "Default Onboarding System Query",
        priority: "MEDIUM",
        category: "BILLING",
        status: "CLOSED",
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString()
      }
    ];
  } catch {
    return [];
  }
};

const saveStoredTickets = (tickets: Ticket[]) => {
  try {
    localStorage.setItem(GET_TICKETS_KEY, JSON.stringify(tickets));
  } catch {}
};

export const ticketService = {
  /**
   * Securely saves support tickets locally.
   */
  async createTicket(ticketData: Omit<Ticket, 'id' | 'createdAt' | 'lastMessageAt'>, initialMessage: string): Promise<string | undefined> {
    const ticketId = "ticket_" + Date.now();
    const newTicket: Ticket = {
      id: ticketId,
      ...ticketData,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      status: 'OPEN'
    };

    const tickets = [newTicket, ...getStoredTickets()];
    saveStoredTickets(tickets);

    const initialReply: TicketMessage = {
      id: "reply_" + Date.now(),
      senderId: ticketData.userId,
      senderName: ticketData.userName,
      senderRole: ticketData.userRole,
      content: initialMessage,
      createdAt: new Date().toISOString()
    };
    try {
      localStorage.setItem(`${GET_MESSAGES_KEY_PREFIX}${ticketId}`, JSON.stringify([initialReply]));
    } catch {}

    return ticketId;
  },

  /**
   * Adds secure customer replies.
   */
  async addReply(ticketId: string, message: Omit<TicketMessage, 'id' | 'createdAt'>, newStatus?: Ticket['status']): Promise<void> {
    const tickets = getStoredTickets();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus || t.status,
          lastMessageAt: new Date().toISOString()
        };
      }
      return t;
    });
    saveStoredTickets(updated);

    try {
      const stored = localStorage.getItem(`${GET_MESSAGES_KEY_PREFIX}${ticketId}`);
      const messages: TicketMessage[] = stored ? JSON.parse(stored) : [];
      const newReply: TicketMessage = {
        id: "reply_" + Date.now(),
        ...message,
        createdAt: new Date().toISOString()
      };
      messages.push(newReply);
      localStorage.setItem(`${GET_MESSAGES_KEY_PREFIX}${ticketId}`, JSON.stringify(messages));
    } catch {}
  },

  /**
   * Lists customer support tickets.
   */
  async getTickets(userId?: string, limitCount: number = 50): Promise<Ticket[]> {
    const tickets = getStoredTickets();
    if (userId) {
      return tickets.filter(t => t.userId === userId).slice(0, limitCount);
    }
    return tickets.slice(0, limitCount);
  },

  /**
   * Queries full conversation threading list.
   */
  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    try {
      const stored = localStorage.getItem(`${GET_MESSAGES_KEY_PREFIX}${ticketId}`);
      return stored ? JSON.parse(stored) : [
        {
          id: "reply_demo_1",
          senderId: "system",
          senderName: "Nexus Support AI",
          senderRole: "SUPER_ADMIN",
          content: "Welcome! Your query has been logged and our operators will support you inline immediately.",
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  },

  /**
   * Operator resolution updates.
   */
  async updateStatus(ticketId: string, status: Ticket['status']): Promise<void> {
    const tickets = getStoredTickets();
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status };
      }
      return t;
    });
    saveStoredTickets(updated);
  }
};
