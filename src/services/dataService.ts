
export interface StoredData {
  employees: any[];
  assignments: any;
  supervisorAssignments: any;
  coordinatorAssignments: any;
  lastUpdated: string;
}

class DataService {
  private readonly STORAGE_KEY = 'security_control_center_data';

  saveData(data: Partial<StoredData>): void {
    try {
      const existingData = this.loadData();
      const updatedData = {
        ...existingData,
        ...data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  loadData(): StoredData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    
    return {
      employees: [],
      assignments: {},
      supervisorAssignments: {},
      coordinatorAssignments: {},
      lastUpdated: new Date().toISOString()
    };
  }

  exportData(): string {
    const data = this.loadData();
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  clearData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const dataService = new DataService();
