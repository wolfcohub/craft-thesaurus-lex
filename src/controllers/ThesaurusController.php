<?php

namespace wolfco\craftthesauruslex\controllers;

use craft\web\Controller;
use yii\web\Response;
use Craft;
use wolfco\craftthesauruslex\ThesaurusLex;

class ThesaurusController extends Controller
{
    protected array|int|bool $allowAnonymous = true;

    // Fetch synonyms with server-side caching
    public function actionGetSynonyms(): Response
    {
        return $this->fetchFromCacheOrApi('thesaurus', 'tKey', function($word, $apiKey) {
            return "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/{$word}?key={$apiKey}";
        });
    }

    // Fetch definitions with server-side caching
    public function actionGetDefinitions(): Response
    {
        return $this->fetchFromCacheOrApi('dictionary', 'dKey', function($word, $apiKey) {
            return "https://www.dictionaryapi.com/api/v3/references/collegiate/json/{$word}?key={$apiKey}";
        });
    }

    // Generalized method for cache or API fetch
    private function fetchFromCacheOrApi(string $cachePrefix, string $apiKeySetting, callable $apiUrlGenerator): Response
    {
        $this->requireAcceptsJson();
        $word = Craft::$app->getRequest()->get('word');

        if (!$word) {
            return $this->asJson(['error' => 'No word provided']);
        }

        $settings = ThesaurusLex::$plugin->getSettings();
        $apiKey = $settings[$apiKeySetting];
        $cacheTTL = $settings->cacheTTL ?? 3600;

        if (!$apiKey) {
            return $this->asJson([
                'error' => "Missing API key for {$cachePrefix}. Set this in Settings -> Plugins -> Thesaurus Lex -> Settings."
            ]);
        }

        // Generate a unique cache key
        $cacheKey = "thesaurusLex_{$cachePrefix}_" . mb_strtolower($word);

        // Check if the data is already cached
        $cachedData = Craft::$app->getCache()->get($cacheKey);
        if ($cachedData !== false) {
            Craft::info("Cache hit for {$cachePrefix}: {$word}", __METHOD__);
            return $this->asJson($cachedData);
        }

        // Call the API
        $apiUrl = $apiUrlGenerator($word, $apiKey);

        try {
            $response = file_get_contents($apiUrl);
            $data = json_decode($response, true);

            // Cache the response
            Craft::$app->getCache()->set($cacheKey, $data, $cacheTTL);

            return $this->asJson($data);
        } catch (\Exception $e) {
          Craft::error("Failed to fetch data from {$cachePrefix} API: {$e->getMessage()}", __METHOD__);
            return $this->asJson(['error' => "Failed to fetch data from {$cachePrefix} API"]);
        }
    }
}
