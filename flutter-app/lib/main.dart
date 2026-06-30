import 'package:flutter/material.dart';

void main() {
  runApp(const SyncSolarApp());
}

class SyncSolarApp extends StatelessWidget {
  const SyncSolarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sync Solar System',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFFF8C1A),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF090E1A),
        useMaterial3: true,
      ),
      home: const DashboardPage(),
    );
  }
}

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D1326),
        title: const Text(
          'Sync Solar System',
          style: TextStyle(color: Color(0xFFFF8C1A), fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _MetricCard(label: 'Total Power', value: '12.4 kW', icon: Icons.bolt),
            const SizedBox(height: 12),
            _MetricCard(label: 'Daily Energy', value: '87.2 kWh', icon: Icons.wb_sunny),
            const SizedBox(height: 12),
            _MetricCard(label: 'Active Panels', value: '24 / 24', icon: Icons.grid_view),
            const SizedBox(height: 12),
            _MetricCard(label: 'Battery', value: '94%', icon: Icons.battery_charging_full),
          ],
        ),
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;

  const _MetricCard({required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0D1326),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFF202940)),
      ),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFFFF8C1A), size: 32),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: const TextStyle(color: Color(0xFF758AB0), fontSize: 13)),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}
