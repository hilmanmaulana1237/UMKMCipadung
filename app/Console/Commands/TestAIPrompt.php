<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Services\AIPromptService;

class TestAIPrompt extends Command
{
    protected $signature = 'test:ai-prompt {email} {mode=store_photo}';
    protected $description = 'Generate a test AI prompt for a user';

    public function handle(AIPromptService $service)
    {
        $email = $this->argument('email');
        $mode = $this->argument('mode');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email $email not found.");
            return;
        }

        $store = $user->umkmStore;
        
        if (!$store) {
            $this->error('User does not have a store.');
            return;
        }

        $prompt = $service->constructVideoPrompt($store, $store->products, $mode);
        
        $this->info("Generated Prompt for {$store->name} (Mode: $mode):");
        $this->line("---------------------------------------------------");
        $this->line($prompt);
        $this->line("---------------------------------------------------");
    }
}
