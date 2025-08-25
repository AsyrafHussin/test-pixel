<?php

namespace App\Console\Commands;

use App\Services\ToyyibPayService;
use Illuminate\Console\Command;

class CreateToyyibPayCategory extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'toyyibpay:create-category {name=Test Category} {description=Test Category for E-commerce}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new ToyyibPay category and get the category code';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $description = $this->argument('description');

        $this->info("Creating ToyyibPay category: {$name}");

        try {
            $toyyibPayService = new ToyyibPayService();
            $categoryCode = $toyyibPayService->createCategory($name, $description);

            if ($categoryCode) {
                $this->info("Category created successfully!");
                $this->info("Category Code: {$categoryCode}");
                $this->info("");
                $this->info("Please update your .env file with:");
                $this->info("TOYYIBPAY_CATEGORY_CODE={$categoryCode}");
                $this->info("");
            } else {
                $this->error("Failed to create category. Check logs for details.");
            }
        } catch (\Exception $e) {
            $this->error("Error creating category: " . $e->getMessage());
        }
    }
}
