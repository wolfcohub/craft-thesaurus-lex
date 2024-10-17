<?php

namespace wolfco\thesaurus;

use craft\base\Model;
use craft\web\twig\variables\CraftVariable;
use craft\events\RegisterUrlRulesEvent;
use yii\base\Event;
use craft\web\UrlManager;

class Plugin extends \craft\base\Plugin
{
    public static Plugin $plugin;

    public bool $hasCpSection = true;
    public bool $hasCpSettings = true;
    public string $schemaVersion = '1.0.0';
    protected string $handle = 'thesaurus-plugin';

    public function init()
    {
        parent::init();
        self::$plugin = $this;

        // Register the controller map to ensure it's accessible
        \Craft::$app->controllerMap['thesaurus'] = 'wolfco\thesaurus\controllers\ThesaurusController';
        \Craft::$app->controllerMap['thesaurus-plugin/settings'] = 'wolfco\thesaurus\controllers\SettingsController';
        // Register custom routes
        Event::on(
            UrlManager::class,
            UrlManager::EVENT_REGISTER_SITE_URL_RULES,
            function (RegisterUrlRulesEvent $event) {
                $event->rules = array_merge($event->rules, require __DIR__ . '/config/routes.php');
            }
        );
    }
    protected function createSettingsModel(): ?Model
    {
        return new \wolfco\thesaurus\models\Settings();
    }

    protected function settingsHtml(): ?string
    {
        return \Craft::$app->view->renderTemplate(
            'thesaurus-plugin/settings',
            [
                'settings' => $this->getSettings(),  // This ensures the saved settings are loaded
            ]
        );
    }
}
