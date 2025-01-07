<?php

namespace wolfco\thesaurus;

use Craft;
use craft\base\Model;
use craft\base\Plugin as BasePlugin;
use craft\ckeditor\Plugin as CkeditorPlugin;
use craft\events\RegisterUrlRulesEvent;
use yii\base\Event;
use craft\web\UrlManager;
use wolfco\thesaurus\assetbundles\CkeditorThesaurusAsset;

class Plugin extends BasePlugin
{
    public static Plugin $plugin;
    public bool $hasCpSettings = true;
    public string $schemaVersion = '1.0.0';
    protected string $handle = 'thesaurus-lex';

    public function init()
    {
        parent::init();
        self::$plugin = $this;

        Craft::setAlias('@plugins/thesaurus-lex', __DIR__);
        CkeditorPlugin::registerCkeditorPackage(CkeditorThesaurusAsset::class);

        // Register the controller map to ensure it's accessible
        Craft::$app->controllerMap['thesaurus'] = 'wolfco\thesaurus\controllers\ThesaurusController';
        Craft::$app->controllerMap['thesaurus-lex/settings'] = 'wolfco\thesaurus\controllers\SettingsController';
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
        return Craft::$app->view->renderTemplate(
            'thesaurus-lex/settings',
            [
                'settings' => $this->getSettings(),  // This ensures the saved settings are loaded
                'version' => $this->schemaVersion,
            ]
        );
    }
}
