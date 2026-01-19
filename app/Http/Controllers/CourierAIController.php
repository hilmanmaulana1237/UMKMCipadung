<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Carbon\Carbon;

class CourierAIController extends Controller
{
    /**
     * Show AI Insights Dashboard for Courier
     */
    public function insights()
    {
        $user = auth()->user();
        
        // Get courier's delivery history
        $deliveries = Order::where('courier_id', $user->id)
            ->where('courier_status', 'delivered')
            ->orderBy('updated_at', 'desc')
            ->get();

        // Calculate stats
        $stats = $this->calculateStats($deliveries);
        
        // Get AI predictions
        $predictions = $this->generatePredictions($deliveries);
        
        // Get peak time analysis
        $peakTimes = $this->analyzePeakTimes($deliveries);
        
        // Get contextual tips
        $tips = $this->generateTips($deliveries, $peakTimes);

        return Inertia::render('courier/ai-insights', [
            'stats' => $stats,
            'predictions' => $predictions,
            'peakTimes' => $peakTimes,
            'tips' => $tips,
            'todayEarnings' => $this->getTodayEarnings($user->id),
            'weekEarnings' => $this->getWeekEarnings($user->id),
        ]);
    }

    /**
     * Get real-time AI predictions via API
     */
    public function getPredictions(): JsonResponse
    {
        $user = auth()->user();
        
        $deliveries = Order::where('courier_id', $user->id)
            ->where('courier_status', 'delivered')
            ->get();
            
        $predictions = $this->generatePredictions($deliveries);
        $peakTimes = $this->analyzePeakTimes($deliveries);
        $tips = $this->generateTips($deliveries, $peakTimes);

        return response()->json([
            'success' => true,
            'predictions' => $predictions,
            'peakTimes' => $peakTimes,
            'tips' => $tips,
        ]);
    }

    /**
     * Calculate courier statistics
     */
    private function calculateStats($deliveries): array
    {
        $totalDeliveries = $deliveries->count();
        $totalEarnings = $deliveries->sum('courier_fee');
        
        // Average per delivery
        $avgPerDelivery = $totalDeliveries > 0 ? $totalEarnings / $totalDeliveries : 0;
        
        // This week's deliveries
        $thisWeekDeliveries = $deliveries->filter(function ($d) {
            return Carbon::parse($d->updated_at)->isCurrentWeek();
        })->count();
        
        // This month's deliveries
        $thisMonthDeliveries = $deliveries->filter(function ($d) {
            return Carbon::parse($d->updated_at)->isCurrentMonth();
        })->count();
        
        // Busiest day
        $byDay = $deliveries->groupBy(function ($d) {
            return Carbon::parse($d->updated_at)->format('l');
        });
        $busiestDay = $byDay->sortByDesc(fn($group) => $group->count())->keys()->first() ?? 'Belum ada data';
        
        return [
            'totalDeliveries' => $totalDeliveries,
            'totalEarnings' => $totalEarnings,
            'avgPerDelivery' => round($avgPerDelivery),
            'thisWeekDeliveries' => $thisWeekDeliveries,
            'thisMonthDeliveries' => $thisMonthDeliveries,
            'busiestDay' => $busiestDay,
        ];
    }

    /**
     * Generate AI earnings predictions
     */
    private function generatePredictions($deliveries): array
    {
        $today = Carbon::now();
        $dayOfWeek = $today->format('l');
        $hour = $today->hour;
        
        // Group deliveries by day of week
        $byDayOfWeek = $deliveries->groupBy(function ($d) {
            return Carbon::parse($d->updated_at)->format('l');
        });
        
        // Get average earnings for today's day of week
        $todaysDayDeliveries = $byDayOfWeek->get($dayOfWeek, collect());
        $avgEarningsToday = $todaysDayDeliveries->avg('courier_fee') ?? 5000;
        $avgDeliveriesToday = 0;
        
        // Calculate average deliveries per occurrence of this day
        if ($todaysDayDeliveries->count() > 0) {
            $uniqueDays = $todaysDayDeliveries->groupBy(function ($d) {
                return Carbon::parse($d->updated_at)->format('Y-m-d');
            })->count();
            $avgDeliveriesToday = $uniqueDays > 0 ? round($todaysDayDeliveries->count() / $uniqueDays) : 0;
        }
        
        // Predicted earnings for today (remaining hours factor)
        $remainingHours = max(21 - $hour, 0); // Assume work until 9pm
        $hourFactor = $remainingHours / 12; // 12 working hours assumption
        
        $predictedToday = round($avgDeliveriesToday * $avgEarningsToday * (0.5 + $hourFactor * 0.5));
        
        // Predicted earnings for week
        $avgWeeklyEarnings = $deliveries->groupBy(function ($d) {
            return Carbon::parse($d->updated_at)->format('W-Y');
        })->avg(function ($week) {
            return $week->sum('courier_fee');
        }) ?? 0;
        
        // Confidence level based on data amount
        $confidence = min(100, $deliveries->count() * 5); // Max 100%
        
        // Tomorrow prediction
        $tomorrow = $today->copy()->addDay();
        $tomorrowDay = $tomorrow->format('l');
        $tomorrowDeliveries = $byDayOfWeek->get($tomorrowDay, collect());
        $avgEarningsTomorrow = $tomorrowDeliveries->avg('courier_fee') ?? 5000;
        $avgDeliveriesTomorrow = 0;
        if ($tomorrowDeliveries->count() > 0) {
            $uniqueDays = $tomorrowDeliveries->groupBy(fn($d) => Carbon::parse($d->updated_at)->format('Y-m-d'))->count();
            $avgDeliveriesTomorrow = $uniqueDays > 0 ? round($tomorrowDeliveries->count() / $uniqueDays) : 0;
        }
        $predictedTomorrow = round($avgDeliveriesTomorrow * $avgEarningsTomorrow);
        
        // Best day prediction
        $bestDay = $byDayOfWeek->sortByDesc(fn($group) => $group->sum('courier_fee'))->keys()->first() ?? $dayOfWeek;
        $bestDayAvg = $byDayOfWeek->get($bestDay, collect())->avg('courier_fee') ?? 0;
        $bestDayCount = 0;
        if ($byDayOfWeek->has($bestDay) && $byDayOfWeek->get($bestDay)->count() > 0) {
            $uniqueDays = $byDayOfWeek->get($bestDay)->groupBy(fn($d) => Carbon::parse($d->updated_at)->format('Y-m-d'))->count();
            $bestDayCount = $uniqueDays > 0 ? round($byDayOfWeek->get($bestDay)->count() / $uniqueDays) : 0;
        }

        // Day names in Indonesian
        $dayNames = [
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa', 
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
            'Sunday' => 'Minggu',
        ];

        return [
            'todayPrediction' => max($predictedToday, 10000),
            'tomorrowPrediction' => max($predictedTomorrow, 10000),
            'weekPrediction' => max(round($avgWeeklyEarnings), 50000),
            'confidence' => max($confidence, 20),
            'bestDay' => $dayNames[$bestDay] ?? $bestDay,
            'bestDayEarnings' => round($bestDayAvg * $bestDayCount),
            'avgPerDelivery' => round($deliveries->avg('courier_fee') ?? 5000),
            'currentDay' => $dayNames[$dayOfWeek] ?? $dayOfWeek,
            'message' => $this->getPredictionMessage($dayOfWeek, $hour, $deliveries->count()),
        ];
    }

    /**
     * Generate prediction message
     */
    private function getPredictionMessage(string $dayOfWeek, int $hour, int $totalDeliveries): string
    {
        $dayMessages = [
            'Monday' => 'Senin biasanya agak sepi, tapi tetap semangat! 💪',
            'Tuesday' => 'Selasa mulai ramai, saatnya hunting order! 🎯',
            'Wednesday' => 'Rabu lumayan sibuk, siap-siap ya! 🚀',
            'Thursday' => 'Kamis biasanya stabil, jaga stamina! 👍',
            'Friday' => 'Jumat sore sampai malam pasti ramai! 🔥',
            'Saturday' => 'Sabtu adalah hari terbaik! Let\'s go! ⚡',
            'Sunday' => 'Minggu santai tapi tetap cuan! 🌟',
        ];

        if ($totalDeliveries < 5) {
            return 'Data masih sedikit, prediksi akan lebih akurat seiring waktu! 📊';
        }

        if ($hour < 10) {
            return 'Pagi hari biasanya sepi, persiapan dulu! ☀️';
        } elseif ($hour < 13) {
            return 'Jam makan siang! Biasanya banyak order makanan 🍜';
        } elseif ($hour < 17) {
            return 'Sore hari mulai ramai, stay alert! 📦';
        } else {
            return $dayMessages[$dayOfWeek] ?? 'Semangat terus! 💪';
        }
    }

    /**
     * Analyze peak times from delivery data
     */
    private function analyzePeakTimes($deliveries): array
    {
        // Group by hour
        $byHour = $deliveries->groupBy(function ($d) {
            return Carbon::parse($d->updated_at)->format('H');
        })->map(fn($group) => $group->count());

        // Find peak hours
        $sortedHours = $byHour->sortDesc();
        $peakHours = $sortedHours->take(3)->keys()->toArray();
        
        // Group by day of week
        $byDay = $deliveries->groupBy(function ($d) {
            return Carbon::parse($d->updated_at)->format('l');
        })->map(fn($group) => $group->count());
        
        $sortedDays = $byDay->sortDesc();
        $peakDays = $sortedDays->take(3)->keys()->toArray();

        // Day names in Indonesian
        $dayNames = [
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
            'Sunday' => 'Minggu',
        ];

        // Create hourly distribution (0-23)
        $hourlyData = [];
        for ($i = 0; $i < 24; $i++) {
            $hour = str_pad($i, 2, '0', STR_PAD_LEFT);
            $hourlyData[] = [
                'hour' => $hour . ':00',
                'count' => $byHour->get($hour, 0),
                'isPeak' => in_array($hour, $peakHours),
            ];
        }

        // Current hour recommendation
        $currentHour = Carbon::now()->hour;
        $nextPeakHour = null;
        foreach ($peakHours as $ph) {
            if ((int)$ph > $currentHour) {
                $nextPeakHour = $ph;
                break;
            }
        }

        return [
            'peakHours' => array_map(fn($h) => $h . ':00-' . ((int)$h + 1) . ':00', $peakHours),
            'peakDays' => array_map(fn($d) => $dayNames[$d] ?? $d, $peakDays),
            'hourlyData' => $hourlyData,
            'nextPeakHour' => $nextPeakHour ? $nextPeakHour . ':00' : null,
            'recommendation' => $this->getPeakTimeRecommendation($peakHours, $currentHour),
        ];
    }

    /**
     * Get peak time recommendation message
     */
    private function getPeakTimeRecommendation(array $peakHours, int $currentHour): string
    {
        $peakInts = array_map('intval', $peakHours);
        
        if (in_array($currentHour, $peakInts)) {
            return '🔥 Sekarang jam ramai! Aktifkan mode kurir segera!';
        }
        
        foreach ($peakInts as $peak) {
            if ($peak > $currentHour && $peak - $currentHour <= 2) {
                return "⏰ Jam ramai sebentar lagi (jam {$peak}:00), standby!";
            }
        }
        
        if ($currentHour < 10) {
            return '☀️ Pagi masih sepi, istirahat dulu atau persiapan.';
        } elseif ($currentHour > 21) {
            return '🌙 Sudah malam, istirahat dan siap besok!';
        }
        
        return '📊 Pantau terus radar untuk order masuk!';
    }

    /**
     * Generate contextual AI tips
     */
    private function generateTips($deliveries, $peakTimes): array
    {
        $tips = [];
        $now = Carbon::now();
        $hour = $now->hour;
        $dayOfWeek = $now->format('l');
        
        // Time-based tips
        if ($hour >= 11 && $hour <= 13) {
            $tips[] = [
                'icon' => '🍜',
                'title' => 'Jam Makan Siang',
                'message' => 'Banyak order makanan! Fokus ke area restoran dan warung.',
                'priority' => 'high',
            ];
        }
        
        if ($hour >= 17 && $hour <= 20) {
            $tips[] = [
                'icon' => '🌆',
                'title' => 'Rush Hour Sore',
                'message' => 'Waktu pulang kerja - order meningkat, tapi hati-hati macet!',
                'priority' => 'high',
            ];
        }
        
        if ($hour >= 20 && $hour <= 22) {
            $tips[] = [
                'icon' => '🌙',
                'title' => 'Prime Time Malam',
                'message' => 'Order makanan malam biasanya banyak, pastikan HP charged!',
                'priority' => 'medium',
            ];
        }
        
        // Day-based tips
        if ($dayOfWeek === 'Friday') {
            $tips[] = [
                'icon' => '🔥',
                'title' => 'TGIF!',
                'message' => 'Jumat biasanya ramai terutama sore-malam. Maximize earnings!',
                'priority' => 'high',
            ];
        }
        
        if (in_array($dayOfWeek, ['Saturday', 'Sunday'])) {
            $tips[] = [
                'icon' => '📦',
                'title' => 'Weekend Mode',
                'message' => 'Weekend order lebih tersebar, bisa aktif lebih pagi!',
                'priority' => 'medium',
            ];
        }
        
        // Weather tip (simulated - in production, use weather API)
        $weatherTips = [
            [
                'icon' => '☀️',
                'title' => 'Cuaca Cerah',
                'message' => 'Cuaca bagus untuk delivery! Jangan lupa bawa air minum.',
                'priority' => 'low',
            ],
            [
                'icon' => '🌧️',
                'title' => 'Kemungkinan Hujan',
                'message' => 'Siapkan jas hujan. Order biasanya naik saat hujan!',
                'priority' => 'medium',
            ],
        ];
        $tips[] = $weatherTips[array_rand($weatherTips)];
        
        // Performance tips
        $totalDeliveries = $deliveries->count();
        if ($totalDeliveries < 10) {
            $tips[] = [
                'icon' => '🎯',
                'title' => 'Tingkatkan Performa',
                'message' => 'Semakin banyak delivery, prediksi AI makin akurat!',
                'priority' => 'medium',
            ];
        } elseif ($totalDeliveries >= 50) {
            $tips[] = [
                'icon' => '🏆',
                'title' => 'Kurir Berpengalaman',
                'message' => 'Sudah ' . $totalDeliveries . ' delivery! Great job, keep it up!',
                'priority' => 'low',
            ];
        }
        
        // Safety tips
        $safetyTips = [
            [
                'icon' => '🛡️',
                'title' => 'Safety First',
                'message' => 'Pastikan helm dan kelengkapan berkendara aman!',
                'priority' => 'low',
            ],
            [
                'icon' => '📱',
                'title' => 'Stay Connected',
                'message' => 'Pastikan HP tercharge dan data aktif untuk terima order.',
                'priority' => 'low',
            ],
        ];
        $tips[] = $safetyTips[array_rand($safetyTips)];

        // Sort by priority
        $priorityOrder = ['high' => 0, 'medium' => 1, 'low' => 2];
        usort($tips, fn($a, $b) => $priorityOrder[$a['priority']] - $priorityOrder[$b['priority']]);

        return array_slice($tips, 0, 5); // Max 5 tips
    }

    /**
     * Get today's earnings
     */
    private function getTodayEarnings(int $courierId): int
    {
        return Order::where('courier_id', $courierId)
            ->where('courier_status', 'delivered')
            ->whereDate('updated_at', Carbon::today())
            ->sum('courier_fee');
    }

    /**
     * Get this week's earnings
     */
    private function getWeekEarnings(int $courierId): int
    {
        return Order::where('courier_id', $courierId)
            ->where('courier_status', 'delivered')
            ->whereBetween('updated_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()])
            ->sum('courier_fee');
    }
}
