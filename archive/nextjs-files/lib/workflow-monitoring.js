import { query } from '../db';

export class WorkflowMonitoringSystem {
  constructor() {
    this.metrics = {
      executionCount: 0,
      successRate: 0,
      averageExecutionTime: 0,
      errorRate: 0
    };
  }

  async getWorkflowMetrics(timeframe = '24h') {
    try {
      const timeCondition = timeframe === '24h' ?
        "created_at > NOW() - INTERVAL '24 hours'" :
        "created_at > NOW() - INTERVAL '7 days'";

      const result = await query(`
        SELECT
          workflow_type,
          COUNT(*) as total_executions,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
          AVG(CASE WHEN status = 'success' THEN execution_time END) as avg_execution_time
        FROM workflow_executions
        WHERE ${timeCondition}
        GROUP BY workflow_type
      `);

      return result.rows;
    } catch (error) {
      console.error('Failed to get workflow metrics:', error);
      return [];
    }
  }

  async generateWorkflowReport() {
    const metrics = await this.getWorkflowMetrics('24h');

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalWorkflows: metrics.length,
        totalExecutions: metrics.reduce((sum, m) => sum + parseInt(m.total_executions), 0),
        overallSuccessRate: this.calculateOverallSuccessRate(metrics)
      },
      workflows: metrics
    };

    return report;
  }

  calculateOverallSuccessRate(metrics) {
    const totalExecutions = metrics.reduce((sum, m) => sum + parseInt(m.total_executions), 0);
    const totalSuccessful = metrics.reduce((sum, m) => sum + parseInt(m.successful_executions), 0);

    return totalExecutions > 0 ? (totalSuccessful / totalExecutions) * 100 : 0;
  }
}

export const workflowMonitoringSystem = new WorkflowMonitoringSystem();
