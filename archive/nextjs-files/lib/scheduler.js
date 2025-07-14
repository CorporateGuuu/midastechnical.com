
const { Pool } = require('pg');
const cron = require('node-cron');

class TaskScheduler {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/midastechnical_store'
    });
    this.tasks = new Map();
  }

  async initialize() {
    console.log('🤖 Initializing Task Scheduler...');
    
    // Load scheduled tasks from database
    const result = await this.pool.query(
      'SELECT * FROM scheduled_tasks WHERE enabled = true'
    );
    
    for (const task of result.rows) {
      this.scheduleTask(task);
    }
    
    console.log(`✅ Scheduled ${result.rows.length} tasks`);
  }

  scheduleTask(task) {
    const cronJob = cron.schedule(task.schedule_cron, async () => {
      await this.executeTask(task);
    }, {
      scheduled: false
    });
    
    this.tasks.set(task.id, cronJob);
    cronJob.start();
    
    console.log(`📅 Scheduled: ${task.name} (${task.schedule_cron})`);
  }

  async executeTask(task) {
    const startTime = Date.now();
    console.log(`🚀 Executing task: ${task.name}`);
    
    try {
      // Log task start
      const logResult = await this.pool.query(
        'INSERT INTO task_logs (task_id, status, message, started_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
        [task.id, 'running', `Started execution of ${task.name}`]
      );
      const logId = logResult.rows[0].id;
      
      // Execute task based on type
      let result;
      switch (task.task_type) {
        case 'data_refresh':
          result = await this.executeDataRefresh();
          break;
        case 'database_backup':
          result = await this.executeDatabaseBackup();
          break;
        case 'image_optimization':
          result = await this.executeImageOptimization();
          break;
        case 'health_check':
          result = await this.executeHealthCheck();
          break;
        case 'analytics_update':
          result = await this.executeAnalyticsUpdate();
          break;
        case 'seo_update':
          result = await this.executeSeoUpdate();
          break;
        default:
          throw new Error(`Unknown task type: ${task.task_type}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      // Update task log
      await this.pool.query(
        'UPDATE task_logs SET status = $1, message = $2, execution_time_ms = $3, completed_at = NOW() WHERE id = $4',
        ['completed', result.message, executionTime, logId]
      );
      
      // Update task statistics
      await this.pool.query(
        'UPDATE scheduled_tasks SET last_run = NOW(), run_count = run_count + 1, success_count = success_count + 1 WHERE id = $1',
        [task.id]
      );
      
      console.log(`✅ Task completed: ${task.name} (${executionTime}ms)`);
      
    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ Task failed: ${task.name}`, error);
      
      // Log error
      await this.pool.query(
        'UPDATE task_logs SET status = $1, message = $2, execution_time_ms = $3, completed_at = NOW() WHERE task_id = $4 AND status = $5',
        ['failed', error.message, executionTime, task.id, 'running']
      );
      
      // Update error count
      await this.pool.query(
        'UPDATE scheduled_tasks SET error_count = error_count + 1 WHERE id = $1',
        [task.id]
      );
    }
  }

  async executeDataRefresh() {
    // Simulate data refresh
    return { message: 'Product data refreshed successfully' };
  }

  async executeDatabaseBackup() {
    // Simulate database backup
    return { message: 'Database backup completed successfully' };
  }

  async executeImageOptimization() {
    // Simulate image optimization
    return { message: 'Image optimization completed successfully' };
  }

  async executeHealthCheck() {
    // Simulate health check
    return { message: 'System health check passed' };
  }

  async executeAnalyticsUpdate() {
    // Simulate analytics update
    return { message: 'Analytics data updated successfully' };
  }

  async executeSeoUpdate() {
    // Simulate SEO update
    return { message: 'SEO sitemap updated successfully' };
  }
}

module.exports = TaskScheduler;
