<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuthUser;
use RuntimeException;

final class GameStateService
{
    private const REGULAR_INGREDIENTS = 999999999;

    private const BALANCE = [
        'baseSatisfactionGain' => 8,
        'preferredSatisfactionGain' => 12,
        'maxSatisfactionPerType' => 40,
        'maxFeedingCapacityBonus' => 80,
        'vipDeliciousnessThreshold' => 3,
        'vipSatisfactionThreshold' => 120,
        'baseScoreMultiplier' => 1,
        'preferredDishScoreMultiplier' => 2,
        'vipPointsPerDeliciousness' => 140,
        'maxCustomers' => 6,
        'overfeedMultiplier' => 1.5,
        'prestigeScoreRequirement' => 50000,
    ];

    private const CUSTOMER_TYPES = [
        ['type' => 'pig', 'name' => 'Pig Girl', 'preferredDishes' => ['blue', 'red'], 'baseDeliciousness' => 2, 'description' => 'Loves hearty main courses and sweet desserts'],
        ['type' => 'cow', 'name' => 'Cow Girl', 'preferredDishes' => ['green', 'yellow'], 'baseDeliciousness' => 3, 'description' => 'Enjoys soups and substantial meals'],
        ['type' => 'sheep', 'name' => 'Sheep Girl', 'preferredDishes' => ['blue', 'green'], 'baseDeliciousness' => 2, 'description' => 'Prefers light appetizers and warm soups'],
        ['type' => 'rabbit', 'name' => 'Rabbit Girl', 'preferredDishes' => ['blue', 'red'], 'baseDeliciousness' => 1, 'description' => 'Loves appetizers and desserts'],
        ['type' => 'cat', 'name' => 'Cat Girl', 'preferredDishes' => ['yellow', 'blue'], 'baseDeliciousness' => 4, 'description' => 'Enjoys main courses and appetizers'],
        ['type' => 'deer', 'name' => 'Deer Girl', 'preferredDishes' => ['green', 'blue'], 'baseDeliciousness' => 3, 'description' => 'Polite and shy, prefers fresh greens and forest-inspired dishes', 'specialTraits' => ['lowAppetite' => true]],
        ['type' => 'duck', 'name' => 'Duck Girl', 'preferredDishes' => ['yellow', 'green'], 'baseDeliciousness' => 2, 'description' => 'Quirky and loud, loves bread-based meals and waterfowl-friendly soups', 'specialTraits' => ['canWander' => true]],
        ['type' => 'chicken', 'name' => 'Chicken Girl', 'preferredDishes' => ['yellow', 'red'], 'baseDeliciousness' => 2, 'description' => 'Nervous and fussy, prefers grain-based meals and fried snacks', 'specialTraits' => ['multipliesOnProcess' => true]],
        ['type' => 'fish', 'name' => 'Fish Girl', 'preferredDishes' => ['blue', 'green'], 'baseDeliciousness' => 4, 'description' => 'Laid-back and cool, enjoys seaweed, sushi, and lighter fare', 'specialTraits' => ['fastSpoilage' => true]],
        ['type' => 'fox', 'name' => 'Fox Girl', 'preferredDishes' => ['red', 'yellow'], 'baseDeliciousness' => 3, 'description' => 'Cunning and playful, loves spicy dishes and street food', 'specialTraits' => ['canStealFood' => true]],
        ['type' => 'goat', 'name' => 'Goat Girl', 'preferredDishes' => ['green', 'yellow'], 'baseDeliciousness' => 2, 'description' => 'Stubborn and quirky, enjoys chewy foods and herbs', 'specialTraits' => ['canEatWaste' => true]],
        ['type' => 'bear', 'name' => 'Bear Girl', 'preferredDishes' => ['red', 'yellow'], 'baseDeliciousness' => 5, 'description' => 'Big appetite and warm demeanor, loves honey desserts and hearty stews', 'specialTraits' => ['highYield' => true]],
        ['type' => 'monkey', 'name' => 'Monkey Girl', 'preferredDishes' => ['red', 'blue'], 'baseDeliciousness' => 2, 'description' => 'Energetic and cheeky, prefers fruits and finger foods', 'specialTraits' => ['throwsFood' => true]],
    ];

    private const DISH_EXAMPLES = [
        'blue' => ['Spring Rolls', 'Cheese Bites', 'Mini Salads'],
        'green' => ['Vegetable Soup', 'Bone Broth', 'Mushroom Bisque'],
        'yellow' => ['Grilled Steaks', 'Roasted Chicken', 'Pasta Dishes'],
        'red' => ['Chocolate Cake', 'Ice Cream', 'Fruit Tarts'],
    ];

    private const GUEST_NAMES = [
        'Mina', 'Sora', 'Luna', 'Nia', 'Kira', 'Momo', 'Ari', 'Rin',
        'Tala', 'Yumi', 'Pia', 'Mira', 'Nori', 'Suki', 'Tori', 'Vivi',
    ];

    private const UPGRADES = [
        ['id' => 'cooking-speed', 'name' => 'Faster Cooking', 'description' => 'Reduce cooking time by 8% per level', 'cost' => 80, 'baseCost' => 80, 'level' => 0, 'maxLevel' => 8, 'costGrowth' => 1.45, 'purchased' => false, 'effects' => ['cookTimeMultiplier' => -0.08]],
        ['id' => 'customer-patience', 'name' => 'Patient Customers', 'description' => 'Customers wait 12% longer per level', 'cost' => 90, 'baseCost' => 90, 'level' => 0, 'maxLevel' => 8, 'costGrowth' => 1.42, 'purchased' => false, 'effects' => ['patienceMultiplier' => 0.12]],
        ['id' => 'processing-efficiency', 'name' => 'Better Processing', 'description' => 'Gain 12% more ingredients from VIP processing per level', 'cost' => 120, 'baseCost' => 120, 'level' => 0, 'maxLevel' => 8, 'costGrowth' => 1.5, 'purchased' => false, 'effects' => ['meatYieldMultiplier' => 0.12]],
        ['id' => 'combo-boost', 'name' => 'Combo Master', 'description' => 'Increase combo scoring by 8% per level', 'cost' => 140, 'baseCost' => 140, 'level' => 0, 'maxLevel' => 10, 'costGrowth' => 1.55, 'purchased' => false, 'effects' => ['comboMultiplier' => 0.08]],
        ['id' => 'dining-room', 'name' => 'Dining Room Expansion', 'description' => 'Add one customer table per level', 'cost' => 180, 'baseCost' => 180, 'level' => 0, 'maxLevel' => 4, 'costGrowth' => 1.9, 'purchased' => false, 'effects' => ['maxCustomersBonus' => 1]],
        ['id' => 'host-stand', 'name' => 'Host Stand', 'description' => 'Customers arrive 6% faster per level', 'cost' => 110, 'baseCost' => 110, 'level' => 0, 'maxLevel' => 6, 'costGrowth' => 1.5, 'purchased' => false, 'effects' => ['spawnIntervalMultiplier' => -0.06]],
        ['id' => 'service-training', 'name' => 'Service Training', 'description' => 'Slow satisfaction decay by 8% per level', 'cost' => 130, 'baseCost' => 130, 'level' => 0, 'maxLevel' => 8, 'costGrowth' => 1.48, 'purchased' => false, 'effects' => ['satisfactionDecayMultiplier' => -0.08]],
        ['id' => 'recipe-marketing', 'name' => 'Recipe Marketing', 'description' => 'Recipes sell for 10% more per level', 'cost' => 260, 'baseCost' => 260, 'level' => 0, 'maxLevel' => 8, 'costGrowth' => 1.7, 'purchased' => false, 'effects' => ['recipeValueMultiplier' => 0.04]],
        ['id' => 'portion-planning', 'name' => 'Portion Planning', 'description' => 'Recipes add 10% more future capacity per level', 'cost' => 280, 'baseCost' => 280, 'level' => 0, 'maxLevel' => 6, 'costGrowth' => 1.75, 'purchased' => false, 'effects' => ['capacityGainMultiplier' => 0.04]],
    ];

    private const RECIPES = [
        ['id' => 'bacon-ramen', 'name' => 'Bacon Ramen', 'description' => 'A rich bowl that sells well and teaches the kitchen how to feed larger guests.', 'ingredients' => ['pig-meat' => 5], 'customerType' => 'pig', 'unlocked' => false, 'unlockCondition' => 'Process 5 Pig Girls', 'profitMultiplier' => 1.6, 'baseValue' => 80, 'capacityBonus' => 2],
        ['id' => 'golden-cutlets', 'name' => 'Golden Cutlets', 'description' => 'A high-volume special that improves prep for bigger appetites.', 'ingredients' => ['chicken-meat' => 6], 'customerType' => 'chicken', 'unlocked' => false, 'unlockCondition' => 'Process 3 Chicken Girls', 'profitMultiplier' => 1.8, 'baseValue' => 95, 'capacityBonus' => 2],
        ['id' => 'tidal-platter', 'name' => 'Tidal Platter', 'description' => 'A delicate course that rewards quick handling and expands portion planning.', 'ingredients' => ['fish-meat' => 5], 'customerType' => 'fish', 'unlocked' => false, 'unlockCondition' => 'Process 3 Fish Girls', 'profitMultiplier' => 1.9, 'baseValue' => 105, 'capacityBonus' => 2],
        ['id' => 'street-skewers', 'name' => 'Street Skewers', 'description' => 'A spicy seller that offsets losses from tricky guests.', 'ingredients' => ['fox-meat' => 5], 'customerType' => 'fox', 'unlocked' => false, 'unlockCondition' => 'Process 3 Fox Girls', 'profitMultiplier' => 2.0, 'baseValue' => 115, 'capacityBonus' => 3],
        ['id' => 'honey-roast-feast', 'name' => 'Honey Roast Feast', 'description' => 'A premium feast built around larger yields and larger future servings.', 'ingredients' => ['bear-meat' => 5], 'customerType' => 'bear', 'unlocked' => false, 'unlockCondition' => 'Process 2 Bear Girls', 'profitMultiplier' => 2.3, 'baseValue' => 150, 'capacityBonus' => 4],
        ['id' => 'rainbow-stew', 'name' => 'Rainbow Stew', 'description' => 'Legendary stew from multiple guest types.', 'ingredients' => ['pig-meat' => 3, 'cow-meat' => 3, 'sheep-meat' => 3, 'rabbit-meat' => 3, 'cat-meat' => 3], 'unlocked' => false, 'unlockCondition' => 'Process one of each animal type in a chain', 'profitMultiplier' => 3.0, 'baseValue' => 220, 'capacityBonus' => 6],
    ];

    private const ACHIEVEMENTS = [
        ['id' => 'first-customer', 'name' => 'First Customer', 'description' => 'Process your first customer', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 1, 'reward' => 50],
        ['id' => 'combo-master', 'name' => 'Combo Master', 'description' => 'Achieve a 10-customer combo chain', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 10, 'reward' => 200],
        ['id' => 'steady-service', 'name' => 'Steady Service', 'description' => 'Serve 25 dishes', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 25, 'reward' => 150],
        ['id' => 'favorite-service', 'name' => 'Favorite Service', 'description' => 'Serve 20 preferred dishes', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 20, 'reward' => 200],
        ['id' => 'recipe-merchant', 'name' => 'Recipe Merchant', 'description' => 'Prepare and sell 5 recipes', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 5, 'reward' => 250],
        ['id' => 'capacity-planner', 'name' => 'Capacity Planner', 'description' => 'Reach +40 future guest capacity', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 40, 'reward' => 300],
        ['id' => 'broad-menu', 'name' => 'Broad Menu', 'description' => 'Process 8 different customer types', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 8, 'reward' => 300],
        ['id' => 'busy-night', 'name' => 'Busy Night', 'description' => 'Earn 1,000 total score', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 1000, 'reward' => 150],
        ['id' => 'restaurant-empire', 'name' => 'Restaurant Empire', 'description' => 'Earn 10,000 total score', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 10000, 'reward' => 500],
        ['id' => 'overfed-specialist', 'name' => 'Overfed Specialist', 'description' => 'Overfeed 10 customers', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 10, 'reward' => 250],
        ['id' => 'fresh-start', 'name' => 'Fresh Start', 'description' => 'Prestige once', 'unlocked' => false, 'progress' => 0, 'maxProgress' => 1, 'reward' => 500],
    ];

    public function __construct(
        private readonly string $gameSlug,
        private readonly string $gameName
    ) {
    }

    public function initialState(): array
    {
        return [
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'game' => $this->initialGame(),
            'progression' => $this->initialProgression(),
            'guests' => [],
            'lastMessage' => 'Welcome to Feast Frenzy!',
            'lastAction' => null,
            'created_at' => gmdate('Y-m-d H:i:s'),
            'updated_at' => gmdate('c'),
        ];
    }

    public function applyIntent(array $currentState, string $intent, array $payload): array
    {
        $state = $this->normalizeState($currentState);
        $state['lastAction'] = $intent;

        switch ($intent) {
            case 'reset_game':
                $state['game'] = $this->initialGame();
                $state['lastMessage'] = 'Game reset.';
                break;
            case 'reset_progress':
                $state['progression'] = $this->initialProgression();
                $state['lastMessage'] = 'Progression reset.';
                break;
            case 'spawn_customer':
                $state = $this->spawnCustomer($state);
                break;
            case 'customer_left':
                $state = $this->customerLeft($state, $this->positiveInt($payload['customerId'] ?? null, 'Customer is required.'));
                break;
            case 'satisfaction_decay_tick':
                $state = $this->satisfactionDecayTick($state);
                break;
            case 'trait_tick':
                $state = $this->traitTick($state);
                break;
            case 'cook_dish':
                $color = $this->stringValue($payload['stationColor'] ?? null, 'Station color is required.');
                $state = $this->cookDish($state, $color);
                break;
            case 'remove_dish':
                $state = $this->removeDish(
                    $state,
                    $this->stringValue($payload['stationColor'] ?? null, 'Station color is required.'),
                    max(0, $this->intValue($payload['dishIndex'] ?? 0))
                );
                break;
            case 'serve_dish':
                $state = $this->serveDish(
                    $state,
                    $this->positiveInt($payload['customerId'] ?? null, 'Customer is required.'),
                    $this->stringValue($payload['dishColor'] ?? null, 'Dish color is required.'),
                    $this->stringValue($payload['dishName'] ?? null, 'Dish name is required.'),
                    max(0, $this->intValue($payload['dishIndex'] ?? 0))
                );
                break;
            case 'process_customer':
                $state = $this->processCustomer($state, $this->positiveInt($payload['customerId'] ?? null, 'Customer is required.'));
                break;
            case 'purchase_upgrade':
                $state = $this->purchaseUpgrade($state, $this->stringValue($payload['upgradeId'] ?? null, 'Upgrade is required.'));
                break;
            case 'craft_recipe':
                $state = $this->craftRecipe($state, $this->stringValue($payload['recipeId'] ?? null, 'Recipe is required.'));
                break;
            case 'prestige':
                $state = $this->prestige($state);
                break;
            case 'set_special_table_busy':
                $state['game']['specialTableBusy'] = ($payload['busy'] ?? false) === true;
                break;
            case 'load':
            case 'save':
                break;
            default:
                throw new RuntimeException('Unknown game intent.');
        }

        $state['updated_at'] = gmdate('c');
        return $state;
    }

    public function response(array $save, AuthUser $user): array
    {
        return [
            'user' => $user->toArray(),
            'save' => [
                'id' => $save['id'],
                'slot' => $save['save_slot'],
                'state' => $this->normalizeState($save['state']),
                'metadata' => $save['metadata'],
                'version' => $save['version'],
                'status' => $save['status'],
                'created_at' => $save['created_at'],
                'updated_at' => $save['updated_at'],
            ],
        ];
    }

    private function initialGame(): array
    {
        return [
            'score' => 0,
            'combo' => 0,
            'chain' => 0,
            'customers' => [],
            'ingredients' => ['regular' => self::REGULAR_INGREDIENTS],
            'cookingTimers' => [],
            'specialTableBusy' => false,
            'chainHistory' => [],
            'nextCustomerId' => 1,
            'dishesReady' => [],
        ];
    }

    private function initialProgression(): array
    {
        return [
            'currency' => 0,
            'upgrades' => self::UPGRADES,
            'recipes' => self::RECIPES,
            'achievements' => self::ACHIEVEMENTS,
            'prestigeLevel' => 0,
            'prestigePoints' => 0,
            'totalScore' => 0,
            'processedCustomerCounts' => [],
            'processedCustomerTypes' => [],
            'feedingCapacityBonus' => 0,
            'craftedRecipeCounts' => [],
            'totalDishesServed' => 0,
            'preferredDishesServed' => 0,
            'overfedCustomerCount' => 0,
            'customersLost' => 0,
        ];
    }

    private function normalizeState(array $state): array
    {
        $base = $this->initialState();
        $game = is_array($state['game'] ?? null) ? array_replace($base['game'], $state['game']) : $base['game'];
        $progression = is_array($state['progression'] ?? null)
            ? array_replace($base['progression'], $state['progression'])
            : $base['progression'];

        $game['score'] = max(0, $this->intValue($game['score'] ?? 0));
        $game['combo'] = max(0, $this->intValue($game['combo'] ?? 0));
        $game['chain'] = max(0, $this->intValue($game['chain'] ?? 0));
        $game['customers'] = array_values(array_filter($game['customers'] ?? [], 'is_array'));
        $game['ingredients'] = is_array($game['ingredients'] ?? null) ? $game['ingredients'] : ['regular' => self::REGULAR_INGREDIENTS];
        $game['ingredients']['regular'] = self::REGULAR_INGREDIENTS;
        $game['cookingTimers'] = is_array($game['cookingTimers'] ?? null) ? $game['cookingTimers'] : [];
        $game['specialTableBusy'] = ($game['specialTableBusy'] ?? false) === true;
        $game['chainHistory'] = array_values(array_filter(array_map(fn (mixed $id): int => $this->intValue($id), $game['chainHistory'] ?? []), fn (int $id): bool => $id > 0));
        $game['nextCustomerId'] = max(1, $this->intValue($game['nextCustomerId'] ?? 1));
        $game['dishesReady'] = is_array($game['dishesReady'] ?? null) ? $game['dishesReady'] : [];

        $progression['currency'] = max(0, $this->intValue($progression['currency'] ?? 0));
        $progression['upgrades'] = $this->normalizeUpgrades($progression['upgrades'] ?? []);
        $progression['recipes'] = $this->normalizeRecipes($progression['recipes'] ?? []);
        $progression['achievements'] = $this->normalizeAchievements($progression['achievements'] ?? []);
        $progression['prestigeLevel'] = max(0, $this->intValue($progression['prestigeLevel'] ?? 0));
        $progression['prestigePoints'] = max(0, $this->intValue($progression['prestigePoints'] ?? 0));
        $progression['totalScore'] = max(0, $this->intValue($progression['totalScore'] ?? 0));
        $progression['processedCustomerCounts'] = is_array($progression['processedCustomerCounts'] ?? null) ? $progression['processedCustomerCounts'] : [];
        $progression['processedCustomerTypes'] = array_values(array_filter($progression['processedCustomerTypes'] ?? [], 'is_string'));
        $progression['feedingCapacityBonus'] = max(0, $this->intValue($progression['feedingCapacityBonus'] ?? 0));
        $progression['craftedRecipeCounts'] = is_array($progression['craftedRecipeCounts'] ?? null) ? $progression['craftedRecipeCounts'] : [];
        $progression['totalDishesServed'] = max(0, $this->intValue($progression['totalDishesServed'] ?? 0));
        $progression['preferredDishesServed'] = max(0, $this->intValue($progression['preferredDishesServed'] ?? 0));
        $progression['overfedCustomerCount'] = max(0, $this->intValue($progression['overfedCustomerCount'] ?? 0));
        $progression['customersLost'] = max(0, $this->intValue($progression['customersLost'] ?? 0));

        return array_replace($base, [
            'schema_version' => 2,
            'game' => $game,
            'progression' => $progression,
            'guests' => array_values(array_filter($state['guests'] ?? [], 'is_array')),
            'lastMessage' => is_string($state['lastMessage'] ?? null) ? $state['lastMessage'] : $base['lastMessage'],
            'lastAction' => is_string($state['lastAction'] ?? null) ? $state['lastAction'] : null,
            'created_at' => is_string($state['created_at'] ?? null) ? $state['created_at'] : $base['created_at'],
            'updated_at' => is_string($state['updated_at'] ?? null) ? $state['updated_at'] : $base['updated_at'],
        ]);
    }

    private function spawnCustomer(array $state): array
    {
        $maxCustomers = self::BALANCE['maxCustomers'] + (int) floor($this->purchasedEffect($state['progression'], 'maxCustomersBonus', 0));
        if (count($state['game']['customers']) >= $maxCustomers) {
            return $state;
        }

        $occupied = array_map(fn (array $customer): int => $this->intValue($customer['tableIndex'] ?? -1), $state['game']['customers']);
        $tableIndex = null;
        for ($index = 0; $index < $maxCustomers; $index++) {
            if (!in_array($index, $occupied, true)) {
                $tableIndex = $index;
                break;
            }
        }

        if ($tableIndex === null) {
            return $state;
        }

        $activeGuestIds = array_map(fn (array $customer): string => (string) ($customer['guestId'] ?? ''), $state['game']['customers']);
        $returningGuest = random_int(1, 100) <= 65 ? $this->returningGuest($state['guests'], $activeGuestIds) : null;
        $type = $returningGuest !== null
            ? $this->customerTypeById((string) $returningGuest['customerType'])
            : $this->randomCustomerType();
        $guest = $returningGuest ?? $this->createGuest($type['type']);

        if ($returningGuest === null) {
            $state['guests'][] = $guest;
        }

        $guestId = (string) $guest['id'];
        $state['guests'] = array_map(function (array $item) use ($guestId): array {
            if ((string) $item['id'] === $guestId) {
                $item['visits'] = (int) $item['visits'] + 1;
                $item['lastSeenAt'] = $this->nowMs();
            }
            return $item;
        }, $state['guests']);

        $baseMax = self::BALANCE['maxSatisfactionPerType'] + (int) $state['progression']['feedingCapacityBonus'];
        $maxSatisfaction = ['blue' => $baseMax, 'green' => $baseMax, 'yellow' => $baseMax, 'red' => $baseMax];
        if (($type['specialTraits']['lowAppetite'] ?? false) === true) {
            $maxSatisfaction = array_map(fn (int $value): int => (int) floor($value * 0.7), $maxSatisfaction);
        }
        if (($type['specialTraits']['highYield'] ?? false) === true) {
            $maxSatisfaction = array_map(fn (int $value): int => (int) floor($value * 1.5), $maxSatisfaction);
        }

        $customer = [
            'id' => (int) $state['game']['nextCustomerId'],
            'guestId' => $guestId,
            'displayName' => (string) $guest['name'],
            'type' => $type,
            'satisfaction' => ['blue' => 0, 'green' => 0, 'yellow' => 0, 'red' => 0],
            'maxSatisfaction' => $maxSatisfaction,
            'deliciousness' => (int) $type['baseDeliciousness'],
            'totalSatisfaction' => 0,
            'overfed' => false,
            'isDragging' => false,
            'tableIndex' => $tableIndex,
            'arrivedAt' => $this->nowMs(),
        ];

        $state['game']['nextCustomerId'] = (int) $state['game']['nextCustomerId'] + 1;
        $state['game']['customers'][] = $customer;
        $state['lastMessage'] = $customer['displayName'] . ' the ' . $type['name'] . ' has arrived at table ' . ($tableIndex + 1) . '.';

        return $state;
    }

    private function customerLeft(array $state, int $customerId): array
    {
        $customer = $this->findCustomer($state, $customerId);
        if ($customer === null) {
            return $state;
        }

        $state['game']['customers'] = $this->removeCustomerById($state['game']['customers'], $customerId);
        $state['game']['combo'] = 0;
        $state['progression']['customersLost'] = (int) $state['progression']['customersLost'] + 1;
        $state['lastMessage'] = $customer['displayName'] . ' left after waiting too long.';
        return $state;
    }

    private function satisfactionDecayTick(array $state): array
    {
        $decay = 0.5 * $this->purchasedEffect($state['progression'], 'satisfactionDecayMultiplier', 1);
        $state['game']['customers'] = array_map(function (array $customer) use ($decay): array {
            if ((float) ($customer['totalSatisfaction'] ?? 0) <= 0) {
                return $customer;
            }

            foreach ($customer['satisfaction'] as $color => $amount) {
                $customer['satisfaction'][$color] = max(0, (float) $amount - $decay);
            }
            $customer['totalSatisfaction'] = array_sum($customer['satisfaction']);
            $customer['overfed'] = $customer['totalSatisfaction'] > array_sum($customer['maxSatisfaction']);
            return $customer;
        }, $state['game']['customers']);

        return $state;
    }

    private function traitTick(array $state): array
    {
        $messages = [];
        $occupied = array_map(fn (array $customer): int => $this->intValue($customer['tableIndex'] ?? -1), $state['game']['customers']);
        $maxCustomers = self::BALANCE['maxCustomers'] + (int) floor($this->purchasedEffect($state['progression'], 'maxCustomersBonus', 0));

        foreach ($state['game']['customers'] as $index => $customer) {
            $traits = $customer['type']['specialTraits'] ?? [];
            if (($traits['canWander'] ?? false) === true && random_int(1, 100) <= 25) {
                $emptyTables = array_values(array_filter(range(0, $maxCustomers - 1), fn (int $table): bool => !in_array($table, $occupied, true)));
                if ($emptyTables !== []) {
                    $nextTable = $emptyTables[random_int(0, count($emptyTables) - 1)];
                    $occupied = array_values(array_diff($occupied, [(int) $customer['tableIndex']]));
                    $occupied[] = $nextTable;
                    $state['game']['customers'][$index]['tableIndex'] = $nextTable;
                    $messages[] = $customer['displayName'] . ' wandered to table ' . ($nextTable + 1) . '.';
                }
            }

            if (($traits['fastSpoilage'] ?? false) === true && (float) $customer['totalSatisfaction'] > 0) {
                foreach ($customer['satisfaction'] as $color => $amount) {
                    $state['game']['customers'][$index]['satisfaction'][$color] = max(0, (float) $amount - 2);
                }
                $state['game']['customers'][$index]['totalSatisfaction'] = array_sum($state['game']['customers'][$index]['satisfaction']);
            }

            if ((($traits['canStealFood'] ?? false) === true && random_int(1, 100) <= 35) ||
                (($traits['throwsFood'] ?? false) === true && (float) $customer['totalSatisfaction'] < 60 && random_int(1, 100) <= 30)) {
                foreach ($state['game']['dishesReady'] as $color => $dishes) {
                    if (is_array($dishes) && count($dishes) > 0) {
                        $dish = (string) array_shift($dishes);
                        $state['game']['dishesReady'][$color] = array_values($dishes);
                        $messages[] = $customer['displayName'] . ' knocked away ' . $dish . '.';
                        break;
                    }
                }
            }
        }

        if ($messages !== []) {
            $state['lastMessage'] = implode(' ', $messages);
        }

        return $state;
    }

    private function cookDish(array $state, string $color): array
    {
        $examples = self::DISH_EXAMPLES[$color] ?? null;
        if ($examples === null) {
            throw new RuntimeException('Unknown cooking station.');
        }

        $dish = $examples[random_int(0, count($examples) - 1)];
        $state['game']['dishesReady'][$color] = array_values([...(array) ($state['game']['dishesReady'][$color] ?? []), $dish]);
        $state['lastMessage'] = $dish . ' is ready.';
        return $state;
    }

    private function serveDish(array $state, int $customerId, string $dishColor, string $dishName, int $dishIndex): array
    {
        $customer = $this->findCustomer($state, $customerId);
        if ($customer === null) {
            throw new RuntimeException('Customer not found.');
        }

        $isPreferred = in_array($dishColor, $customer['type']['preferredDishes'], true);
        $canEatWaste = ($customer['type']['specialTraits']['canEatWaste'] ?? false) === true;
        $satisfactionGain = $isPreferred || $canEatWaste
            ? self::BALANCE['preferredSatisfactionGain'] - ($isPreferred ? 0 : 2)
            : self::BALANCE['baseSatisfactionGain'];
        $deliciousnessGain = ($isPreferred || $canEatWaste) ? 1 : 0;
        $overfeedMultiplier = ($customer['type']['specialTraits']['lowAppetite'] ?? false) === true ? 1.25 : self::BALANCE['overfeedMultiplier'];
        $newSatisfaction = $customer['satisfaction'];
        $newSatisfaction[$dishColor] = min(
            (float) $customer['maxSatisfaction'][$dishColor] * $overfeedMultiplier,
            (float) $customer['satisfaction'][$dishColor] + $satisfactionGain
        );
        $newTotal = array_sum($newSatisfaction);
        $maxTotal = array_sum($customer['maxSatisfaction']);
        $isOverfed = $newTotal > $maxTotal;

        $state['game']['customers'] = array_map(function (array $item) use ($customerId, $newSatisfaction, $newTotal, $isOverfed, $deliciousnessGain): array {
            if ((int) $item['id'] !== $customerId) {
                return $item;
            }

            $item['satisfaction'] = $newSatisfaction;
            $item['deliciousness'] = min(5, (int) $item['deliciousness'] + $deliciousnessGain);
            $item['totalSatisfaction'] = $newTotal;
            $item['overfed'] = $isOverfed;
            return $item;
        }, $state['game']['customers']);

        $state = $this->removeDish($state, $dishColor, $dishIndex);
        $state = $this->recordServedDish($state, $isPreferred, $isOverfed);
        $state = $this->recordGuestField($state, (string) $customer['guestId'], 'feedings');
        $state = $this->addScore($state, $satisfactionGain * ($isPreferred ? self::BALANCE['preferredDishScoreMultiplier'] : self::BALANCE['baseScoreMultiplier']));
        $state['lastMessage'] = $customer['displayName'] . ' ate ' . $dishName . '.';

        return $state;
    }

    private function processCustomer(array $state, int $customerId): array
    {
        $customer = $this->findCustomer($state, $customerId);
        if ($customer === null) {
            throw new RuntimeException('Customer not found.');
        }

        if (!$this->canProcessCustomer($customer)) {
            throw new RuntimeException($customer['displayName'] . ' is not ready for the VIP dining experience yet.');
        }

        if (random_int(1, 100) > 85) {
            $state['lastMessage'] = $customer['displayName'] . ' changed their mind. Try again later.';
            return $state;
        }

        $yieldMultiplier = $this->purchasedEffect($state['progression'], 'meatYieldMultiplier', 1);
        $traitYieldMultiplier = ($customer['type']['specialTraits']['highYield'] ?? false) === true ? 1.35 : 1;
        $bonusMeat = ($customer['type']['specialTraits']['multipliesOnProcess'] ?? false) === true ? 2 : 0;
        $meatGained = max(1, (int) floor(((int) floor((float) $customer['totalSatisfaction'] / 20) + (int) floor((float) $customer['deliciousness'])) * $yieldMultiplier * $traitYieldMultiplier) + $bonusMeat);
        $meatType = $customer['type']['type'] . '-meat';
        $points = (int) self::BALANCE['vipPointsPerDeliciousness'] * (int) $customer['deliciousness'] + $meatGained * 10;
        $nextChain = (int) $state['game']['chain'] + 1;

        $state['game']['customers'] = $this->removeCustomerById($state['game']['customers'], $customerId);
        $state['game']['combo'] = (int) $state['game']['combo'] + 1;
        $state['game']['chainHistory'][] = $customerId;
        $state['game']['chain'] = $nextChain;
        $state['game']['ingredients'][$meatType] = (int) ($state['game']['ingredients'][$meatType] ?? 0) + $meatGained;
        $state = $this->recordGuestField($state, (string) $customer['guestId'], 'processedCount');
        $state = $this->addScore($state, $points);
        $state['progression']['currency'] = (int) $state['progression']['currency'] + (int) floor($points / 5);
        $state = $this->recordProcessedCustomer($state, (string) $customer['type']['type'], $nextChain);
        $state['lastMessage'] = $customer['displayName'] . ' accepted the VIP invitation. Gained ' . $meatGained . ' ' . $meatType . '.';

        return $state;
    }

    private function purchaseUpgrade(array $state, string $upgradeId): array
    {
        foreach ($state['progression']['upgrades'] as $index => $upgrade) {
            if ($upgrade['id'] !== $upgradeId) {
                continue;
            }

            $level = (int) ($upgrade['level'] ?? 0);
            $maxLevel = (int) ($upgrade['maxLevel'] ?? 1);
            if ($level >= $maxLevel) {
                return $state;
            }

            $cost = $this->upgradeCost($upgrade);
            if ((int) $state['progression']['currency'] < $cost) {
                throw new RuntimeException('Not enough currency for that upgrade.');
            }

            $state['progression']['currency'] = (int) $state['progression']['currency'] - $cost;
            $nextLevel = $level + 1;
            $state['progression']['upgrades'][$index]['level'] = $nextLevel;
            $state['progression']['upgrades'][$index]['cost'] = (int) ceil((float) $upgrade['baseCost'] * ((float) $upgrade['costGrowth'] ** $nextLevel));
            $state['progression']['upgrades'][$index]['purchased'] = $nextLevel >= $maxLevel;
            $state['lastMessage'] = $upgrade['name'] . ' upgraded.';
            return $state;
        }

        throw new RuntimeException('Upgrade not found.');
    }

    private function craftRecipe(array $state, string $recipeId): array
    {
        foreach ($state['progression']['recipes'] as $recipe) {
            if ($recipe['id'] !== $recipeId) {
                continue;
            }

            if (($recipe['unlocked'] ?? false) !== true) {
                throw new RuntimeException('Recipe is locked.');
            }

            foreach ($recipe['ingredients'] as $ingredient => $amount) {
                if ((int) ($state['game']['ingredients'][$ingredient] ?? 0) < (int) $amount) {
                    throw new RuntimeException('Not enough ingredients for that recipe yet.');
                }
            }

            foreach ($recipe['ingredients'] as $ingredient => $amount) {
                $state['game']['ingredients'][$ingredient] = (int) $state['game']['ingredients'][$ingredient] - (int) $amount;
            }

            $recipeValueMultiplier = $this->purchasedEffect($state['progression'], 'recipeValueMultiplier', 1);
            $capacityGainMultiplier = $this->purchasedEffect($state['progression'], 'capacityGainMultiplier', 1);
            $scoreGained = (int) floor((int) $recipe['baseValue'] * (float) $recipe['profitMultiplier'] * $recipeValueMultiplier);
            $capacityBonus = max(1, (int) floor((int) $recipe['capacityBonus'] * $capacityGainMultiplier));
            $state = $this->addScore($state, $scoreGained, false);
            $state['progression']['currency'] = (int) $state['progression']['currency'] + (int) floor($scoreGained / 4);
            $state = $this->recordCraftedRecipe($state, $recipeId, $capacityBonus);
            $state['lastMessage'] = $recipe['name'] . ' sold for ' . $scoreGained . ' score.';
            return $state;
        }

        throw new RuntimeException('Recipe not found.');
    }

    private function prestige(array $state): array
    {
        if ((int) $state['progression']['totalScore'] < self::BALANCE['prestigeScoreRequirement']) {
            throw new RuntimeException('Earn more score before prestiging.');
        }

        $reward = $this->prestigeReward($state['progression']);
        $prestigeLevel = (int) $state['progression']['prestigeLevel'] + 1;
        $prestigePoints = (int) $state['progression']['prestigePoints'] + $reward;
        $currency = (int) $state['progression']['currency'] + $reward;
        $state['game'] = $this->initialGame();
        $state['progression'] = $this->initialProgression();
        $state['progression']['prestigeLevel'] = $prestigeLevel;
        $state['progression']['prestigePoints'] = $prestigePoints;
        $state['progression']['currency'] = $currency;
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'fresh-start', 1);
        $state['lastMessage'] = 'Restaurant prestiged.';
        return $state;
    }

    private function addScore(array $state, int $points, bool $applyCombo = true): array
    {
        $comboBoost = $this->purchasedEffect($state['progression'], 'comboMultiplier', 1);
        $prestigeMultiplier = 1 + (int) $state['progression']['prestigePoints'] * 0.03;
        $comboMultiplier = $applyCombo ? 1 + (int) $state['game']['combo'] * 0.1 * $comboBoost : 1;
        $scoredPoints = (int) floor($points * $comboMultiplier * $prestigeMultiplier);
        $state['game']['score'] = (int) $state['game']['score'] + $scoredPoints;
        $state['progression']['totalScore'] = (int) $state['progression']['totalScore'] + max(0, $scoredPoints);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'busy-night', (int) $state['progression']['totalScore']);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'restaurant-empire', (int) $state['progression']['totalScore']);
        return $state;
    }

    private function recordServedDish(array $state, bool $isPreferred, bool $isOverfed): array
    {
        $state['progression']['totalDishesServed'] = (int) $state['progression']['totalDishesServed'] + 1;
        $state['progression']['preferredDishesServed'] = (int) $state['progression']['preferredDishesServed'] + ($isPreferred ? 1 : 0);
        $state['progression']['overfedCustomerCount'] = (int) $state['progression']['overfedCustomerCount'] + ($isOverfed ? 1 : 0);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'steady-service', (int) $state['progression']['totalDishesServed']);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'favorite-service', (int) $state['progression']['preferredDishesServed']);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'overfed-specialist', (int) $state['progression']['overfedCustomerCount']);
        return $state;
    }

    private function recordProcessedCustomer(array $state, string $customerType, int $chainLength): array
    {
        $state['progression']['processedCustomerCounts'][$customerType] = (int) ($state['progression']['processedCustomerCounts'][$customerType] ?? 0) + 1;
        $state['progression']['processedCustomerTypes'] = array_values(array_unique([...$state['progression']['processedCustomerTypes'], $customerType]));
        $counts = $state['progression']['processedCustomerCounts'];
        $types = $state['progression']['processedCustomerTypes'];
        $baseTypes = ['pig', 'cow', 'sheep', 'rabbit', 'cat'];
        $state['progression']['recipes'] = array_map(function (array $recipe) use ($counts, $types, $baseTypes): array {
            $unlock = match ($recipe['id']) {
                'bacon-ramen' => (int) ($counts['pig'] ?? 0) >= 5,
                'golden-cutlets' => (int) ($counts['chicken'] ?? 0) >= 3,
                'tidal-platter' => (int) ($counts['fish'] ?? 0) >= 3,
                'street-skewers' => (int) ($counts['fox'] ?? 0) >= 3,
                'honey-roast-feast' => (int) ($counts['bear'] ?? 0) >= 2,
                'rainbow-stew' => count(array_intersect($baseTypes, $types)) === count($baseTypes),
                default => false,
            };
            if ($unlock) {
                $recipe['unlocked'] = true;
            }
            return $recipe;
        }, $state['progression']['recipes']);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'first-customer', 1);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'combo-master', $chainLength);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'broad-menu', count($types));
        return $state;
    }

    private function recordCraftedRecipe(array $state, string $recipeId, int $capacityBonus): array
    {
        $state['progression']['feedingCapacityBonus'] = min(
            self::BALANCE['maxFeedingCapacityBonus'],
            (int) $state['progression']['feedingCapacityBonus'] + max(0, $capacityBonus)
        );
        $state['progression']['craftedRecipeCounts'][$recipeId] = (int) ($state['progression']['craftedRecipeCounts'][$recipeId] ?? 0) + 1;
        $totalCrafted = array_sum($state['progression']['craftedRecipeCounts']);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'recipe-merchant', (int) $totalCrafted);
        $state['progression']['achievements'] = $this->achievementProgress($state['progression']['achievements'], 'capacity-planner', (int) $state['progression']['feedingCapacityBonus']);
        return $state;
    }

    private function achievementProgress(array $achievements, string $achievementId, int $progress): array
    {
        return array_map(function (array $achievement) use ($achievementId, $progress): array {
            if ($achievement['id'] !== $achievementId) {
                return $achievement;
            }
            $achievement['progress'] = min(max((int) $achievement['progress'], $progress), (int) $achievement['maxProgress']);
            $achievement['unlocked'] = (bool) $achievement['unlocked'] || $progress >= (int) $achievement['maxProgress'];
            return $achievement;
        }, $achievements);
    }

    private function normalizeUpgrades(mixed $raw): array
    {
        if (!is_array($raw)) {
            return self::UPGRADES;
        }

        $saved = [];
        foreach ($raw as $item) {
            if (is_array($item) && is_string($item['id'] ?? null)) {
                $saved[$item['id']] = $item;
            }
        }

        return array_map(fn (array $template): array => array_replace($template, $saved[$template['id']] ?? []), self::UPGRADES);
    }

    private function normalizeRecipes(mixed $raw): array
    {
        if (!is_array($raw)) {
            return self::RECIPES;
        }

        $saved = [];
        foreach ($raw as $item) {
            if (is_array($item) && is_string($item['id'] ?? null)) {
                $saved[$item['id']] = $item;
            }
        }

        return array_map(fn (array $template): array => array_replace($template, $saved[$template['id']] ?? []), self::RECIPES);
    }

    private function normalizeAchievements(mixed $raw): array
    {
        if (!is_array($raw)) {
            return self::ACHIEVEMENTS;
        }

        $saved = [];
        foreach ($raw as $item) {
            if (is_array($item) && is_string($item['id'] ?? null)) {
                $saved[$item['id']] = $item;
            }
        }

        return array_map(fn (array $template): array => array_replace($template, $saved[$template['id']] ?? []), self::ACHIEVEMENTS);
    }

    private function findCustomer(array $state, int $customerId): ?array
    {
        foreach ($state['game']['customers'] as $customer) {
            if ((int) $customer['id'] === $customerId) {
                return $customer;
            }
        }

        return null;
    }

    private function removeCustomerById(array $customers, int $customerId): array
    {
        return array_values(array_filter($customers, fn (array $customer): bool => (int) $customer['id'] !== $customerId));
    }

    private function removeDish(array $state, string $stationColor, int $dishIndex): array
    {
        $dishes = (array) ($state['game']['dishesReady'][$stationColor] ?? []);
        if (isset($dishes[$dishIndex])) {
            array_splice($dishes, $dishIndex, 1);
            $state['game']['dishesReady'][$stationColor] = array_values($dishes);
        }

        return $state;
    }

    private function canProcessCustomer(array $customer): bool
    {
        return (float) $customer['deliciousness'] >= self::BALANCE['vipDeliciousnessThreshold']
            && (float) $customer['totalSatisfaction'] > self::BALANCE['vipSatisfactionThreshold'];
    }

    private function purchasedEffect(array $progression, string $effectKey, float $fallback): float
    {
        $value = $fallback;
        foreach ($progression['upgrades'] as $upgrade) {
            if (!array_key_exists($effectKey, $upgrade['effects'])) {
                continue;
            }

            $level = (int) ($upgrade['level'] ?? 0);
            $value += (float) $upgrade['effects'][$effectKey] * $level;
        }

        return $fallback === 1.0 ? max(0.25, $value) : $value;
    }

    private function upgradeCost(array $upgrade): int
    {
        return (int) ceil((float) $upgrade['baseCost'] * ((float) $upgrade['costGrowth'] ** (int) $upgrade['level']));
    }

    private function prestigeReward(array $progression): int
    {
        $scoreReward = (int) floor((int) $progression['totalScore'] / 10000);
        $achievementReward = count(array_filter($progression['achievements'], fn (array $achievement): bool => ($achievement['unlocked'] ?? false) === true));
        $capacityReward = (int) floor((int) $progression['feedingCapacityBonus'] / 20);
        return max(1, $scoreReward + $achievementReward + $capacityReward);
    }

    private function customerTypeById(string $typeId): array
    {
        foreach (self::CUSTOMER_TYPES as $type) {
            if ($type['type'] === $typeId) {
                return $type;
            }
        }

        return self::CUSTOMER_TYPES[0];
    }

    private function randomCustomerType(): array
    {
        return self::CUSTOMER_TYPES[random_int(0, count(self::CUSTOMER_TYPES) - 1)];
    }

    private function returningGuest(array $guests, array $activeGuestIds): ?array
    {
        $eligible = array_values(array_filter($guests, fn (array $guest): bool =>
            (int) ($guest['feedings'] ?? 0) > 0 && !in_array((string) ($guest['id'] ?? ''), $activeGuestIds, true)
        ));

        return $eligible === [] ? null : $eligible[random_int(0, count($eligible) - 1)];
    }

    private function createGuest(string $customerType): array
    {
        $name = self::GUEST_NAMES[random_int(0, count(self::GUEST_NAMES) - 1)];
        return [
            'id' => $customerType . '-' . strtolower($name) . '-' . bin2hex(random_bytes(3)),
            'name' => $name,
            'customerType' => $customerType,
            'visits' => 0,
            'feedings' => 0,
            'processedCount' => 0,
            'lastSeenAt' => $this->nowMs(),
        ];
    }

    private function recordGuestField(array $state, string $guestId, string $field): array
    {
        $state['guests'] = array_map(function (array $guest) use ($guestId, $field): array {
            if ((string) $guest['id'] === $guestId) {
                $guest[$field] = (int) ($guest[$field] ?? 0) + 1;
                $guest['lastSeenAt'] = $this->nowMs();
            }
            return $guest;
        }, $state['guests']);

        return $state;
    }

    private function positiveInt(mixed $value, string $message): int
    {
        $id = $this->intValue($value);
        if ($id <= 0) {
            throw new RuntimeException($message);
        }

        return $id;
    }

    private function stringValue(mixed $value, string $message): string
    {
        if (!is_string($value) || $value === '') {
            throw new RuntimeException($message);
        }

        return $value;
    }

    private function intValue(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }

    private function nowMs(): int
    {
        return (int) floor(microtime(true) * 1000);
    }
}
