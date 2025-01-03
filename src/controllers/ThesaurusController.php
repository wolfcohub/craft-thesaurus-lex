<?php

namespace wolfco\thesaurus\controllers;

use craft\web\Controller;
use yii\web\Response;
use Craft;
use wolfco\thesaurus\Plugin;

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
        $settings = Plugin::$plugin->getSettings();
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
        $settings = Plugin::$plugin->getSettings();
        $dictionaryApiKey = $settings->dKey;

        if (!$dictionaryApiKey) {
          return $this->asJson(['error' => 'Missing dictionary API key. You can set this in Settings -> Plugins -> Thesaurus Lex -> Settings']);
        }

        // Dictionary API request
        $apiUrl = "https://www.dictionaryapi.com/api/v3/references/collegiate/json/{$word}?key={$dictionaryApiKey}";

        $response = file_get_contents($apiUrl);
        $data = json_decode($response, true);

        if (isset($data['error'])) {
            return $this->asJson(['error' => $data['error']]);
        }

        return $this->asJson($data);
    }
}
