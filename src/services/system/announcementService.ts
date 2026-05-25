import { Announcement, Role } from '../../types/index';

let inMemoryAnnouncements: Announcement[] = [
  {
    id: "ann_welcome",
    title: "Welcome to NexusCore V2-Stabilized",
    content: "We have fully transitioned to postgres + API-first operational engines.",
    targetRoles: ["SUPER_ADMIN", "AGENCY", "RESELLER"],
    type: "INFO",
    priority: "MEDIUM",
    createdBy: "system",
    createdAt: new Date().toISOString()
  }
];

export const announcementService = {
  /**
   * Generates a new administrative announcement.
   */
  async createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<string | undefined> {
    const id = "ann_" + Date.now();
    const newAnn: Announcement = {
      id,
      type: "INFO",
      priority: "MEDIUM",
      createdBy: "system",
      ...data,
      createdAt: new Date().toISOString()
    };
    inMemoryAnnouncements.unshift(newAnn);
    return id;
  },

  /**
   * Lists relevant announcements based on operator permissions and roles.
   */
  async getLatestAnnouncements(userRole: Role, count: number = 5): Promise<Announcement[]> {
    return inMemoryAnnouncements.filter(ann => ann.targetRoles.includes(userRole)).slice(0, count);
  },

  /**
   * Safe removal function.
   */
  async deleteAnnouncement(id: string): Promise<void> {
    inMemoryAnnouncements = inMemoryAnnouncements.filter(ann => ann.id !== id);
  }
};
