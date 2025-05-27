import { IBApi, EventName, ErrorCode } from '@stoqey/ib';

export interface IBConnectionConfig {
    host: string;
    port: number;
    clientId: number;
}

export interface IBConnectionStatus {
    connected: boolean;
    lastUpdate: string;
    error?: string;
}

class IBService {
    private ib: IBApi | null = null;
    private connectionStatus: IBConnectionStatus = {
        connected: false,
        lastUpdate: new Date().toISOString()
    };

    private config: IBConnectionConfig = {
        host: process.env.IB_HOST || '127.0.0.1',
        port: parseInt(process.env.IB_PORT || '7497'), // TWS Paper Trading port
        clientId: parseInt(process.env.IB_CLIENT_ID || '1')
    };

    constructor() {
        console.log('🔌 IBService initialized with config:', {
            host: this.config.host,
            port: this.config.port,
            clientId: this.config.clientId
        });
    }

    /**
     * Initialize IB API connection
     */
    public async connect(): Promise<IBConnectionStatus> {
        try {
            if (this.ib) {
                console.log('⚠️ IB connection already exists, disconnecting first...');
                await this.disconnect();
            }

            console.log('🔌 Attempting to connect to IB...');

            // Create new IB API instance
            this.ib = new IBApi({
                host: this.config.host,
                port: this.config.port,
                clientId: this.config.clientId
            });

            // Set up event handlers
            this.setupEventHandlers();

            // Attempt connection
            this.ib.connect();

            // Wait for connection or timeout
            const connected = await this.waitForConnection(5000); // 5 second timeout

            if (connected) {
                this.connectionStatus = {
                    connected: true,
                    lastUpdate: new Date().toISOString()
                };
                console.log('✅ Successfully connected to IB');
            } else {
                this.connectionStatus = {
                    connected: false,
                    lastUpdate: new Date().toISOString(),
                    error: 'Connection timeout - ensure TWS/IB Gateway is running'
                };
                console.log('❌ Failed to connect to IB: timeout');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.connectionStatus = {
                connected: false,
                lastUpdate: new Date().toISOString(),
                error: errorMessage
            };
            console.error('❌ IB connection error:', errorMessage);
        }

        return this.connectionStatus;
    }

    /**
     * Disconnect from IB API
     */
    public async disconnect(): Promise<void> {
        if (this.ib) {
            try {
                this.ib.disconnect();
                this.ib = null;
                this.connectionStatus = {
                    connected: false,
                    lastUpdate: new Date().toISOString()
                };
                console.log('🔌 Disconnected from IB');
            } catch (error) {
                console.error('❌ Error disconnecting from IB:', error);
            }
        }
    }

    /**
     * Get current connection status
     */
    public getConnectionStatus(): IBConnectionStatus {
        return { ...this.connectionStatus };
    }

    /**
     * Check if connected to IB
     */
    public isConnected(): boolean {
        return this.connectionStatus.connected && this.ib !== null;
    }

    /**
     * Get IB API instance (for advanced usage)
     */
    public getIBApi(): IBApi | null {
        return this.ib;
    }

    /**
     * Set up event handlers for IB API
     */
    private setupEventHandlers(): void {
        if (!this.ib) return;

        // Connection events
        this.ib.on(EventName.connected, () => {
            console.log('🔗 IB API connected');
            this.connectionStatus.connected = true;
            this.connectionStatus.lastUpdate = new Date().toISOString();
        });

        this.ib.on(EventName.disconnected, () => {
            console.log('🔌 IB API disconnected');
            this.connectionStatus.connected = false;
            this.connectionStatus.lastUpdate = new Date().toISOString();
        });

        // Error handling
        this.ib.on(EventName.error, (err: Error, code: ErrorCode, reqId: number) => {
            console.error(`🚨 IB API Error [${code}] (reqId: ${reqId}):`, err.message);

            // Update connection status on critical errors
            if (code === ErrorCode.CONNECT_FAIL || code === ErrorCode.NOT_CONNECTED) {
                this.connectionStatus.connected = false;
                this.connectionStatus.error = err.message;
                this.connectionStatus.lastUpdate = new Date().toISOString();
            }
        });

        // Server info
        this.ib.on(EventName.server, (version: number, connectionTime: string) => {
            console.log(`📡 IB Server version: ${version}, connection time: ${connectionTime}`);
        });

        // Next valid order ID (indicates successful connection)
        this.ib.on(EventName.nextValidId, (orderId: number) => {
            console.log(`📋 Next valid order ID: ${orderId}`);
        });
    }

    /**
     * Wait for connection to be established
     */
    private waitForConnection(timeoutMs: number): Promise<boolean> {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const checkConnection = () => {
                if (this.connectionStatus.connected) {
                    resolve(true);
                } else if (Date.now() - startTime > timeoutMs) {
                    resolve(false);
                } else {
                    setTimeout(checkConnection, 100);
                }
            };

            checkConnection();
        });
    }
}

// Export singleton instance
export const ibService = new IBService();
export default ibService; 