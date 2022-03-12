export interface Extension {
    id: string;
    name: string;
    description: string;
    publisher: string;
    version: string;
    installed: boolean;
    icon: string;
    registry: string;
}