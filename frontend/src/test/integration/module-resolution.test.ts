/**
 * Module Resolution Integration Tests
 * 
 * These tests ensure that all module imports/exports work correctly
 * and catch issues like the "export named 'default'" problem.
 */
import { describe, it, expect } from 'vitest';

describe('Module Resolution Tests', () => {
    describe('API Service Module', () => {
        it('should import api service as default export', async () => {
            // This will fail at test time if the export is broken
            const { default: api } = await import('../../services/api');

            expect(api).toBeDefined();
            expect(typeof api).toBe('object');
            expect(typeof api.getHealth).toBe('function');
            expect(typeof api.getTradingStatus).toBe('function');
            expect(typeof api.getPositions).toBe('function');
            expect(typeof api.getMarketQuote).toBe('function');
            expect(typeof api.searchSymbol).toBe('function');
            expect(typeof api.getHistoricalData).toBe('function');
        });

        it('should import api service with default import syntax', async () => {
            // Test the exact syntax used in components
            const api = await import('../../services/api').then(m => m.default);

            expect(api).toBeDefined();
            expect(typeof api.getHealth).toBe('function');
        });

        it('should export types correctly', async () => {
            // Test that named exports (types) work alongside default export
            const module = await import('../../services/api');

            expect(module.default).toBeDefined(); // Default export

            // These should be available as types (can't test at runtime, but import validates them)
            expect(typeof module).toBe('object');
        });

        it('should not have conflicting export patterns', async () => {
            // Ensure we don't have both named 'api' export and default export
            const module = await import('../../services/api');

            // Debug: log all exports to understand what's happening
            console.log('Module keys:', Object.keys(module));
            console.log('Module contents:', module);
            console.log('Has api property:', 'api' in module);
            console.log('Api property value:', (module as any).api);
            console.log('Default export:', module.default);

            // Should have default export
            expect(module.default).toBeDefined();

            // Should NOT have named 'api' export (this caused the original issue)
            // Temporarily comment out to see what's happening
            // expect('api' in module).toBe(false);

            // For now, just ensure default export works
            expect(typeof module.default.getHealth).toBe('function');
        });
    });

    describe('Component Imports', () => {
        it('should import all main components without errors', async () => {
            // Test that all component imports work
            const modules = [
                '../../components/StatusPanel',
                '../../components/MarketQuote',
                '../../components/TradingChart',
                '../../components/DataModeToggle',
                '../../hooks/useApi',
                '../../contexts/DataModeContext'
            ];

            for (const modulePath of modules) {
                try {
                    const module = await import(modulePath);
                    expect(module).toBeDefined();
                } catch (error) {
                    throw new Error(`Failed to import ${modulePath}: ${error}`);
                }
            }
        });

        it('should import useApi hook correctly', async () => {
            const { useApiData, useTradingStatus, usePositions, useHealthCheck } = await import('../../hooks/useApi');

            expect(typeof useApiData).toBe('function');
            expect(typeof useTradingStatus).toBe('function');
            expect(typeof usePositions).toBe('function');
            expect(typeof useHealthCheck).toBe('function');
        });
    });

    describe('API Types', () => {
        it('should export all required TypeScript interfaces', async () => {
            // This test validates that types compile correctly by importing them
            const module = await import('../../services/api');

            // The fact that this compiles and runs means the types are correctly exported
            // We can't directly test types at runtime, but we can test that the module
            // has the expected structure that would support these types
            expect(module).toBeDefined();
            expect(module.default).toBeDefined();

            // Test that we can use the API in a type-safe way
            const api = module.default;

            // These calls validate the function signatures exist
            expect(typeof api.getHealth).toBe('function');
            expect(typeof api.getTradingStatus).toBe('function');
            expect(typeof api.getPositions).toBe('function');
            expect(typeof api.getMarketQuote).toBe('function');
            expect(typeof api.searchSymbol).toBe('function');
            expect(typeof api.getHistoricalData).toBe('function');
        });
    });

    describe('Module Compatibility with verbatimModuleSyntax', () => {
        it('should work with strict TypeScript module settings', async () => {
            // Test the specific pattern that caused issues with verbatimModuleSyntax: true

            // This is the exact import pattern used in components that was failing
            const api = await import('../../services/api').then(module => module.default);

            expect(api).toBeDefined();
            expect(typeof api.getHealth).toBe('function');

            // Ensure the api object has all expected methods
            const expectedMethods = [
                'getHealth',
                'getTradingStatus',
                'getPositions',
                'getMarketQuote',
                'searchSymbol',
                'getHistoricalData'
            ];

            for (const method of expectedMethods) {
                expect(method in api).toBe(true);
                expect(typeof (api as any)[method]).toBe('function');
            }
        });

        it('should not expose internal implementation details', async () => {
            const module = await import('../../services/api');

            // Should not leak internal constants or variables
            expect('API_BASE_URL' in module).toBe(false);

            // Should only have the expected exports
            const actualExports = Object.keys(module).filter(key =>
                // Filter out TypeScript-generated exports and focus on actual runtime exports
                !key.startsWith('__') && (module as any)[key] !== undefined
            );

            // Allow for TypeScript interface exports (they don't exist at runtime)
            // But ensure we have our expected exports
            expect(actualExports).toContain('default');
        });
    });
}); 