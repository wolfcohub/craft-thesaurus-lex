<?php

namespace wolfco\craftthesauruslex\controllers;

use craft\web\Controller;
use yii\web\Response;
use Craft;
use wolfco\craftthesauruslex\ThesaurusLex;

class ThesaurusController extends Controller
{
    protected array|int|bool $allowAnonymous = true;

    public function actionGetSynonyms(): Response
    {
        $this->requireAcceptsJson();
        $word = Craft::$app->getRequest()->get('word');

        if (!$word) {
          return $this->asJson(['error' => 'No word provided']);
        }
        $settings = ThesaurusLex::$plugin->getSettings();
        $thesaurusApiKey = $settings['tKey'];

        if (!$thesaurusApiKey) {
          return $this->asJson(['error' => 'Missing thesaurus API key. You can set this in Settings -> Plugins -> Thesaurus Lex -> Settings']);
        }

        // Thesaurus API request
        $apiUrl = "https://www.dictionaryapi.com/api/v3/references/thesaurus/json/{$word}?key={$thesaurusApiKey}";

        $response = file_get_contents($apiUrl);
        $data = json_decode($response, true);

        if (isset($data['error'])) {
            return $this->asJson(['error' => $data['error']]);
        }

        return $this->asJson($data);
    }
    public function actionGetDefinitions(): Response
    {
        $this->requireAcceptsJson();
        $word = Craft::$app->getRequest()->get('word');

        if (!$word) {
            return $this->asJson(['error' => 'No word provided']);
        }
        $settings = ThesaurusLex::$plugin->getSettings();
        $dictionaryApiKey = $settings->dKey;
        // @todo let's add cacheTTL to Settings model and make it configurable by user
        $cacheTTL = 3600;

        if (!$dictionaryApiKey) {
          return $this->asJson(['error' => 'Missing dictionary API key. You can set this in Settings -> Plugins -> Thesaurus Lex -> Settings']);
        }

        // 1. Generate a unique cache key for this word
        $cacheKey = 'thesaurusLex_dictionary_' . mb_strtolower($word);

        // 2. Attempt to retrieve data from cache
        $cachedData = Craft::$app->getCache()->get($cacheKey);
        if ($cachedData !== false) {
            Craft::info("Dictionary cache hit for word: {$word}", __METHOD__);
            // Cache hit: Return this data
            return $this->asJson($cachedData);
        }

        // 3. Cache miss: Call the Dictionary API
        $apiUrl = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/{$word}?key={$dictionaryApiKey}";

        $response = file_get_contents($apiUrl);
        $data = json_decode($response, true);

        if (isset($data['error'])) {
            return $this->asJson(['error' => $data['error']]);
        }

        // 4. Save API response in cache
        Craft::$app->getCache()->set($cacheKey, $data, $cacheTTL);

        return $this->asJson($data);
    }
}
