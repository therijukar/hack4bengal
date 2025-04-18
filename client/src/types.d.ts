// Declaration file for missing module types

// Fix react-dom/client module
declare module 'react-dom' {
  export function createRoot(container: Element | Document | DocumentFragment | Comment, options?: any): {
    render(children: React.ReactNode): void;
    unmount(): void;
  };
  export const version: string;
  export function render(element: React.ReactNode, container: Element | Document | DocumentFragment, callback?: () => void): void;
  export function hydrate(element: React.ReactNode, container: Element | Document | DocumentFragment, callback?: () => void): void;
  export function unmountComponentAtNode(container: Element | Document | DocumentFragment): boolean;
  export function findDOMNode(component: React.ReactInstance | null | undefined): Element | null | Text;
  export function createPortal(children: React.ReactNode, container: Element | Document | DocumentFragment, key?: null | string): React.ReactPortal;
}

// Fix leaflet module declarations
declare module 'leaflet' {
  interface LatLng {
    lat: number;
    lng: number;
  }
  
  interface LatLngExpression {
    lat: number;
    lng: number;
  }
  
  interface LeafletMouseEvent {
    latlng: LatLng;
  }
  
  class Map {
    on(event: string, handler: (e: any) => void): this;
  }
  
  class TileLayer {
    // Empty class declaration
  }
  
  // Declare the L namespace
  namespace L {
    class Icon {
      static Default: {
        prototype: any;
        _getIconUrl?: string;
        mergeOptions(options: any): void;
      };
    }
  }
  
  // Export the L namespace as default
  export default L;
}

// Fix MapContainer and TileLayer props in react-leaflet
declare module 'react-leaflet' {
  import { FC, ReactNode, RefAttributes } from 'react';
  import { Map as LeafletMap, TileLayer as LeafletTileLayer } from 'leaflet';

  export interface MapContainerProps {
    children: ReactNode;
    center: [number, number];
    zoom: number;
    style?: React.CSSProperties;
    className?: string;
    [key: string]: any;
  }

  export interface TileLayerProps {
    attribution?: string;
    url: string;
    [key: string]: any;
  }

  export const MapContainer: FC<MapContainerProps & RefAttributes<LeafletMap>>;
  export const TileLayer: FC<TileLayerProps & RefAttributes<LeafletTileLayer>>;
  export const Marker: FC<any>;
  export const Popup: FC<any>;
  export function useMapEvents(events: any): any;
}

// Fix AuthContext TypeScript integration
declare module '../context/AuthContext' {
  type User = {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };

  type AuthContextType = {
    currentUser: User | null;
    loading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    isSuperAdmin: () => boolean;
    isAuthenticated: () => boolean;
  };

  export const AuthContext: React.Context<AuthContextType>;
  export default function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element;
}

// Allow any type for web-vitals to fix import issues
declare module 'web-vitals' {
  export const getCLS: any;
  export const getFID: any;
  export const getFCP: any;
  export const getLCP: any;
  export const getTTFB: any;
  export type ReportHandler = (metric: any) => void;
} 